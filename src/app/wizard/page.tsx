"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Music, ImageIcon, MessageSquare, Lock, Save, Copy, Check, 
  ArrowRight, ArrowLeft, X, Sparkles, Star, Zap, Info, Loader2 as LucideLoader, 
  Plus, Trash2, FileText, Upload, Shield, Cake, Gift, Bell, GraduationCap, Baby, PartyPopper, CheckCircle2, User, Palette, Eye, Mail, Clock, Smartphone
} from 'lucide-react';
import { SanctuaryConfig, SanctuaryPayload } from '@/utils/config';
import { generateMasterKey, exportKey, encryptData, deriveKeyFromPasscode, toBase64URL } from '@/utils/crypto';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { useSanctuary } from '@/utils/SanctuaryContext';
import Dashboard from '@/components/Dashboard';
import Invitation from '@/components/Invitation';
import { THEMES } from '@/utils/themes';
import { toPng } from 'html-to-image';

const OCCASIONS = [
    { id: 'anniversary', name: 'Anniversary', icon: <Heart size={18} />, theme: 'classic', question: 'Happy Anniversary, my love.' },
    { id: 'birthday', name: 'Birthday', icon: <Cake size={18} />, theme: 'celebration', question: 'Happy Birthday! Ready for your surprise?' },
    { id: 'wedding', name: 'Wedding', icon: <Star size={18} />, theme: 'minimalist', question: 'To our forever. Happy Wedding Day.' },
    { id: 'valentine', name: 'Valentine', icon: <Heart size={18} />, theme: 'classic', question: 'Will you be my Valentine?' },
    { id: 'boyfriend', name: 'National Boyfriend Day', icon: <Star size={18} />, theme: 'midnight', question: 'Happy National Boyfriend Day!' },
    { id: 'girlfriend', name: 'National Girlfriend Day', icon: <Heart size={18} />, theme: 'lavender', question: 'Happy National Girlfriend Day!' },
    { id: 'christmas', name: 'Advent Calendar', icon: <Bell size={18} />, theme: 'advent', question: 'A little magic for every day.' },
    { id: 'graduation', name: 'Graduation', icon: <GraduationCap size={18} />, theme: 'midnight', question: 'You did it! Happy Graduation!' },
    { id: 'baby', name: 'New Baby', icon: <Baby size={18} />, theme: 'lavender', question: 'Welcome to the world, little one.' },
    { id: 'party', name: 'Just Because', icon: <PartyPopper size={18} />, theme: 'monochrome', question: 'A little something, just because.' },
    { id: 'team', name: 'Team / Office', icon: <User size={18} />, theme: 'minimalist', question: 'A token of our appreciation.' }
];

function WizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialPlan = (searchParams.get('plan') as 'spark' | 'plus' | 'infinite') || 'spark';
  const success = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');
  const paidPlan = searchParams.get('paid_plan') as 'spark' | 'plus' | 'infinite';

  const [step, setStep] = useState(success ? 8 : 1);
  const [isPaying, setIsPaying] = useState(false);
  const [isSocialVerifying, setIsSocialVerifying] = useState(false);
  const [socialUnlock, setSocialUnlock] = useState(false);
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [socialError, setSocialError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(success && !!sessionId);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { setPreviewConfig, applyTheme } = useSanctuary();
  
  const [config, setConfig] = useState<SanctuaryConfig>({
    plan: initialPlan,
    theme: 'classic',
    occasion: 'anniversary',
    names: { sender: '', recipient: '' },
    targetDate: new Date().toISOString().split('T')[0],
    anniversaryDate: new Date().toISOString().split('T')[0],
    totalDays: initialPlan === 'spark' ? 1 : 3,
    spotifyTracks: { "day0": "" },
    notes: [
      { id: 'note1', day: 0, content: 'A special message for you.' }
    ],
    passcode: '1402',
    videoUrl: '',
    galleryImages: {}
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [configLength, setConfigLength] = useState(0);
  const [totalNotesLength, setTotalNotesLength] = useState(0);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  const activeTheme = THEMES[config.theme || 'classic'];
  const ThemeIcon = activeTheme?.icon === 'heart' ? Heart : 
                    activeTheme?.icon === 'star' ? Star : 
                    activeTheme?.icon === 'cake' ? Cake : Gift;

  // Apply theme to Wizard UI
  useEffect(() => {
    applyTheme(config.theme);
  }, [config.theme, applyTheme]);

  // Monitor config size for URL limits
  useEffect(() => {
    const encoded = btoa(JSON.stringify(config));
    setConfigLength(encoded.length);
    const notesLen = config.notes.reduce((acc, note) => acc + (note.content?.length || 0), 0);
    setTotalNotesLength(notesLen);
  }, [config]);

  // Secure Session Verification
  useEffect(() => {
    if (success && sessionId) {
      const verify = async () => {
        try {
          const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
          const data = await res.json();
          
          if (data.success) {
            const saved = localStorage.getItem('pending_sanctuary_config');
            if (saved) {
              const parsed = JSON.parse(saved);
              parsed.plan = data.plan || parsed.plan;
              parsed.signature = data.signature; // HMAC proof
              setConfig(parsed);
              
              await finalizeSanctuary(parsed);
            }
          } else {
            alert("Payment verification failed.");
            setStep(1);
          }
        } catch (e) {
          console.error("Verification error", e);
        } finally {
          setIsVerifying(false);
        }
      };
      verify();
    }
  }, [success, sessionId]);

  const PLAN_LIMITS = {
    viral: { days: 1, notes: 5, gallery: 10, video: false, branding: true, background: true },
    spark: { days: 1, notes: 5, gallery: 10, video: false, branding: true, background: true },
    plus: { days: 7, notes: 25, gallery: 30, video: false, branding: false, background: true },
    infinite: { days: 14, notes: 500, gallery: 50, video: true, branding: false, background: true }
  };

  const currentLimits = PLAN_LIMITS[config.plan];

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const parts = path.split('.');
      let current: any = newConfig;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newConfig;
    });
  };

  const batchUpdateConfig = (updates: Record<string, any>) => {
    setConfig(prev => {
        const newConfig = { ...prev };
        Object.entries(updates).forEach(([path, value]) => {
            const parts = path.split('.');
            let current: any = newConfig;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = { ...current[parts[i]] };
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        });
        return newConfig;
    });
  };

  const uploadFile = async (file: File) => {
    const res = await fetch('/api/upload/challenge');
    const challenge = await res.json();
    
    if (challenge.error) {
        throw new Error(challenge.error);
    }

    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      clientPayload: JSON.stringify(challenge),
    });
    return newBlob.url;
  };

  const deleteAsset = async (url: string) => {
    try {
        const encodedConfig = btoa(JSON.stringify(config));
        await fetch('/api/delete-blobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: [url], config: encodedConfig })
        });
    } catch (e) {
        console.error("Failed to delete asset from cloud", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, isGallery = false, dayKey?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(path);
    try {
      if (isGallery && dayKey) {
        const totalImages = Object.values(config.galleryImages || {}).reduce((acc, day) => acc + day.length, 0);
        if (totalImages + files.length > currentLimits.gallery) {
            alert(`Limit reached.`);
            setUploading(null);
            return;
        }
        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadFile(files[i]);
          uploadedUrls.push(url);
        }
        const existing = config.galleryImages?.[dayKey] || [];
        updateConfig(`galleryImages.${dayKey}`, [...existing, ...uploadedUrls]);
      } else {
        const url = await uploadFile(files[0]);
        updateConfig(path, url);
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  const finalizeSanctuary = async (finalConfig: SanctuaryConfig) => {
    try {
      const sanitizedConfig = { ...finalConfig };
      
      if (finalConfig.passcode && finalConfig.passcode !== '1402') {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltBase64 = toBase64URL(salt.buffer);
        const passcodeKey = await deriveKeyFromPasscode(finalConfig.passcode, saltBase64);
        
        const encryptedNotes = await encryptData(finalConfig.notes, passcodeKey);
        const encryptedVideo = await encryptData(finalConfig.videoUrl, passcodeKey);
        
        (sanitizedConfig as any).encryptedNotes = encryptedNotes;
        (sanitizedConfig as any).encryptedVideo = encryptedVideo;
        (sanitizedConfig as any).passcodeSalt = saltBase64;
        
        sanitizedConfig.notes = [];
        sanitizedConfig.videoUrl = '';
      }

      const masterKey = await generateMasterKey();
      const exportedMasterKey = await exportKey(masterKey);
      const { ciphertext, iv } = await encryptData(sanitizedConfig, masterKey);

      const payload: SanctuaryPayload = { d: ciphertext, iv };
      const query = new URLSearchParams(payload as any).toString();
      const url = `${window.location.origin}/?${query}#${exportedMasterKey}`;
      
      // Save to Workspace
      const newSanctuary = {
        id: crypto.randomUUID(),
        recipient: finalConfig.names.recipient,
        date: finalConfig.targetDate,
        url: url,
        plan: finalConfig.plan,
        createdAt: Date.now()
      };
      const existing = localStorage.getItem('sanctuary_workspace');
      const workspace = existing ? JSON.parse(existing) : [];
      localStorage.setItem('sanctuary_workspace', JSON.stringify([...workspace, newSanctuary]));

      setGeneratedLink(url);
      setStep(8);
    } catch (e) {
      console.error("Encryption failed", e);
      alert("Security step failed.");
    }
  };

  const handleGenerate = async () => {
    if (config.plan === 'spark' && socialUnlock && !success) {
        if (!tiktokUrl) {
            alert("Please provide your TikTok post URL.");
            return;
        }
        
        setIsSocialVerifying(true);
        setSocialError('');
        try {
            const res = await fetch('/api/verify-social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tiktokUrl, partnerNames: `${config.names.sender}:${config.names.recipient}` })
            });
            const data = await res.json();
            if (data.success) {
                const updatedConfig = { ...config, plan: data.plan, signature: data.signature };
                setConfig(updatedConfig);
                await finalizeSanctuary(updatedConfig);
            } else {
                setSocialError(data.error || "Verification failed. Make sure you tagged @valentizewiz");
            }
        } catch (e) {
            setSocialError("Network error. Please try again.");
        } finally {
            setIsSocialVerifying(false);
        }
        return;
    }

    if (!success) {
        setIsPaying(true);
        localStorage.setItem('pending_sanctuary_config', JSON.stringify(config));
        
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: config.plan, config })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Checkout error.");
                setIsPaying(false);
            }
        } catch (e) {
            console.error(e);
            setIsPaying(false);
        }
        return;
    }

    await finalizeSanctuary(config);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Destructive action. Confirm?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
        const urls = [];
        if (config.backgroundUrl) urls.push(config.backgroundUrl);
        if (config.videoUrl) urls.push(config.videoUrl);
        if (config.galleryImages) {
            Object.values(config.galleryImages).forEach(dayImages => {
                urls.push(...dayImages);
            });
        }

        if (urls.length > 0) {
            const encodedConfig = btoa(JSON.stringify(config));
            await fetch('/api/delete-blobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls, config: encodedConfig })
            });
        }

        alert("Deleted.");
        window.location.href = '/wizard';
    } catch (e) {
        alert("Failed to delete.");
    } finally {
        setIsDeleting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = async () => {
    if (!userEmail || !generatedLink) return;
    setIsSendingEmail(true);
    try {
        const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: userEmail, 
                url: generatedLink,
                recipient: config.names.recipient,
                sender: config.names.sender
            })
        });
        if (res.ok) {
            setEmailSent(true);
        } else {
            const errData = await res.json();
            alert(`Failed to send email: ${errData.error || 'Check your configuration.'}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsSendingEmail(false);
    }
  };

  const downloadShareCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
        const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
        
        // Try to use Web Share API for direct mobile sharing (TikTok/IG)
        if (navigator.share && (navigator as any).canShare) {
            const blob = await fetch(dataUrl).then(res => res.blob());
            const file = new File([blob], 'gift-announcement.png', { type: 'image/png' });
            
            if ((navigator as any).canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Gift Sanctuary',
                    text: 'I just created a digital sanctuary!'
                });
                setIsDownloading(false);
                return;
            }
        }

        // Fallback to download for desktop
        const link = document.createElement('a');
        link.download = `gift-for-${config.names.recipient.toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error("Failed to share/download card", err);
    } finally {
        setIsDownloading(false);
    }
  };

  const steps = [
    { title: "Select Plan", icon: <Star /> },
    { title: "The Occasion", icon: <Sparkles /> },
    { title: "The Music", icon: <Music /> },
    { title: "The Gallery", icon: <ImageIcon /> },
    { title: "The Notes", icon: <MessageSquare /> },
    { title: "The Video", icon: <Eye /> },
    { title: "The Secret", icon: <Lock /> },
    { title: "Share", icon: <Check /> }
  ];

  const getDaysArray = () => {
    const days = [];
    for (let i = 0; i < config.totalDays; i++) {
      days.push(i);
    }
    return days; // 0 is big day, 1 is day before, etc.
  };

  const UpgradeNudge = ({ target }: { target: 'plus' | 'infinite' }) => (
    <div className="p-4 bg-sanctuary-primary/5 rounded-2xl border border-sanctuary-primary/20 flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-2 text-left">
        <Sparkles className="text-sanctuary-primary shrink-0" size={20} />
        <div>
            <p className="text-xs font-bold text-sanctuary-primary uppercase tracking-wider mb-1">Upgrade Available</p>
            <p className="text-[11px] text-sanctuary-soft mb-2">
                Unlock more days, photos, and the secret cinema.
            </p>
            <button onClick={() => setStep(1)} className="text-[10px] bg-sanctuary-primary text-white px-3 py-1 rounded-full font-bold uppercase">View Plans</button>
        </div>
    </div>
  );

  if (isVerifying) {
      return (
        <main className="min-h-screen bg-sanctuary-bg flex flex-col items-center justify-center p-8 text-center text-gray-800 relative overflow-hidden">
            <video 
              src="/videos/loading-background.mp4"
              poster="/videos/loading-poster.jpg"
              autoPlay 
              muted 
              loop 
              playsInline
              className="absolute inset-0 w-full h-full object-cover blur-md opacity-20"
            />
            <div className="space-y-6 text-center relative z-10">
                <LucideLoader className="w-16 h-16 text-sanctuary-primary animate-spin mx-auto text-center" />
                <h2 className="text-2xl font-bold font-sacramento text-4xl text-center">Securing your gift...</h2>
            </div>
        </main>
      );
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB] p-4 md:p-8 flex flex-col items-center text-gray-800">
      <div className="max-w-3xl w-full bg-white rounded-[40px] shadow-xl overflow-hidden flex flex-col min-h-[650px] border border-black/[0.03]">
        <div className="bg-sanctuary-primary p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-white/20 rounded-2xl shadow-inner backdrop-blur-sm">
                {steps[step-1]?.icon}
            </div>
            <div>
                <h1 className="text-2xl font-serif-display tracking-tight text-white">Sanctuary</h1>
                <p className="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em]">{config.plan} Plan • Step {step} of 8</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {step > 1 && step < 8 && (
                <button 
                    onClick={() => { setPreviewConfig(config); setPreviewRefreshKey(prev => prev + 1); setIsPreviewing(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[10px] text-white font-bold uppercase tracking-widest border border-white/20 shadow-lg"
                >
                    <Zap size={14} className="fill-current" /> Preview
                </button>
            )}
            <Link href="/" className="hover:bg-white/10 p-2.5 rounded-full transition-colors text-white">
                <X size={24} />
            </Link>
          </div>
        </div>

        <div className="h-1 bg-white/10 w-full flex">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <div key={s} className={`h-full transition-all duration-500 ${s <= step ? 'bg-white' : ''}`} style={{ width: '12.5%' }} />
          ))}
        </div>

        <div className="flex-grow p-6 sm:p-10 overflow-y-auto custom-scrollbar bg-sanctuary-bg/50 text-gray-800">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 text-left">
              {step === 1 && (
                <div className="space-y-8 text-center text-gray-800">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-serif-display text-slate-900">Choose a Plan</h3>
                        <p className="text-slate-500 font-playfair italic">Select the depth of your sanctuary experience.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
                        {[
                            { id: 'spark', name: 'The Spark', price: '1.99', icon: <Zap size={24} />, features: ['1 Day Journey', '5 Messages', '10 Photos'], missing: ['No Custom Background', 'With Branding', 'No Secret Cinema'], hasSocial: true },
                            { id: 'plus', name: 'The Romance', price: '6.99', icon: <Heart size={24} />, features: ['7 Day Journey', '25 Messages', '30 Photos', 'Custom Background', 'No Watermark'], missing: ['No Secret Cinema'], popular: true },
                            { id: 'infinite', name: 'The Sanctuary', price: '11.99', icon: <Star size={24} />, features: ['14 Day Journey', 'Unlimited Messages', '50 Photos', 'Private Video Cinema', 'No Watermark'], missing: [] }
                        ].map((p) => (
                            <button 
                                key={p.id}
                                onClick={() => batchUpdateConfig({ plan: p.id, totalDays: PLAN_LIMITS[p.id as keyof typeof PLAN_LIMITS].days })}
                                className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group text-left ${config.plan === p.id ? 'bg-white border-sanctuary-primary shadow-xl ring-4 ring-sanctuary-primary/5' : p.hasSocial ? 'bg-white border-cyan-400/50 shadow-sm border-dashed' : 'bg-white/50 border-black/[0.03] hover:border-sanctuary-secondary'}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${config.plan === p.id ? 'bg-sanctuary-primary text-white' : p.hasSocial ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-100 text-slate-400 group-hover:bg-sanctuary-secondary group-hover:text-sanctuary-primary'}`}>
                                        {p.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold uppercase tracking-widest ${config.plan === p.id ? 'text-sanctuary-primary' : 'text-slate-400'}`}>{p.name}</span>
                                            {p.popular && <span className="text-[8px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Most Popular</span>}
                                            {p.hasSocial && <span className="text-[8px] bg-cyan-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter animate-bounce">DEAL</span>}
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-xs font-bold text-slate-400">$</span>
                                            <span className="text-3xl font-serif-display text-slate-900 leading-none">{p.price}</span>
                                            <span className="text-[10px] text-slate-400 font-medium ml-1">one-time</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <div className="flex flex-col items-end gap-1">
                                        {p.features.slice(0, 2).map(f => <span key={f} className="text-[9px] text-slate-500 font-medium flex items-center gap-1"><Check size={8} className={p.hasSocial && f.includes('TikTok') ? 'text-cyan-500' : 'text-green-500'} /> {f}</span>)}
                                        {p.missing.length > 0 && <span className="text-[9px] text-slate-300 font-medium flex items-center gap-1 opacity-50"><X size={8} /> {p.missing[0]}</span>}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 text-left text-gray-800">
                  <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-serif-display text-slate-900">The Occasion</h3>
                        <p className="text-sm text-slate-500 font-playfair italic">What are we celebrating today?</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {OCCASIONS.map((o) => (
                            <button 
                                key={o.id}
                                onClick={() => batchUpdateConfig({ occasion: o.id, theme: o.theme, customQuestion: o.question })}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${config.occasion === o.id ? 'bg-white border-sanctuary-primary shadow-lg ring-4 ring-sanctuary-primary/5' : 'bg-white/50 border-black/[0.03] hover:border-sanctuary-secondary hover:bg-white'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.occasion === o.id ? 'bg-sanctuary-primary text-white' : 'bg-slate-50 text-slate-400'}`}>{o.icon}</div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-center">{o.name}</span>
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Partners</label>
                        <div className="flex flex-col gap-3">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 group-focus-within:text-sanctuary-primary transition-colors"><User size={16} /></div>
                                <input type="text" value={config.names.sender} onChange={(e) => updateConfig('names.sender', e.target.value)} placeholder="Your Name" className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none transition-all text-sm font-medium" />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 group-focus-within:text-sanctuary-primary transition-colors"><Heart size={16} /></div>
                                <input type="text" value={config.names.recipient} onChange={(e) => updateConfig('names.recipient', e.target.value)} placeholder="Recipient's Name" className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none transition-all text-sm font-medium" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Key Dates</label>
                        <div className="flex flex-col gap-3">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 group-focus-within:text-sanctuary-primary transition-colors"><Star size={16} /></div>
                                <input type="date" value={config.targetDate} onChange={(e) => updateConfig('targetDate', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none transition-all text-sm font-medium" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300 uppercase">The Big Day</span>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 group-focus-within:text-sanctuary-primary transition-colors"><Clock size={16} /></div>
                                <input type="date" value={config.anniversaryDate} onChange={(e) => updateConfig('anniversaryDate', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none transition-all text-sm font-medium" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300 uppercase tracking-tighter text-right">Relationship<br/>Start</span>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Atmosphere</label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {Object.keys(THEMES).map(t => (
                            <button 
                                key={t} 
                                onClick={() => updateConfig('theme', t)}
                                className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center gap-2 overflow-hidden relative ${config.theme === t ? 'border-sanctuary-primary ring-4 ring-sanctuary-primary/5' : 'border-black/[0.03] hover:border-sanctuary-secondary'}`}
                                style={{ backgroundColor: THEMES[t].colors.bg }}
                            >
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: THEMES[t].colors.primary }} />
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: THEMES[t].colors.secondary }} />
                                {config.theme === t && <div className="absolute inset-0 bg-sanctuary-primary/5" />}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Aesthetic Background</label>
                        {!currentLimits.background && <span className="text-[8px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Included in Romance</span>}
                    </div>
                    <div className={`p-6 rounded-[32px] border-2 border-dashed transition-all ${config.backgroundUrl ? 'bg-white border-sanctuary-primary/20' : 'bg-slate-50 border-black/[0.05] hover:border-sanctuary-secondary'}`}>
                        {config.backgroundUrl ? (
                            <div className="flex items-center gap-4 group">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-sanctuary-secondary/20 shadow-sm bg-gray-50"><img src={config.backgroundUrl} alt="" className="w-full h-full object-cover" /></div>
                                <div className="flex-grow">
                                    <p className="text-xs font-bold text-sanctuary-primary uppercase tracking-widest">Background Set</p>
                                    <button onClick={() => { const url = config.backgroundUrl; updateConfig('backgroundUrl', ''); if (url) deleteAsset(url); }} className="text-[10px] text-slate-400 underline uppercase font-bold hover:text-red-500 transition-colors">Remove Image</button>
                                </div>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center gap-3 cursor-pointer`}>
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 transition-all group-hover:text-sanctuary-primary">
                                    {uploading === 'backgroundUrl' ? <LucideLoader className="animate-spin text-sanctuary-primary" size={24} /> : <Upload size={24} />}
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{uploading === 'backgroundUrl' ? 'Uploading...' : 'Upload Atmospheric Photo'}</span>
                                    <p className="text-[8px] text-slate-300 mt-1 italic">High-res vertical photos look best</p>
                                </div>
                                <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={(e) => handleFileUpload(e, 'backgroundUrl')} />
                            </label>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 text-left text-gray-800">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif-display text-slate-900">Atmospheric Audio</h3>
                    <p className="text-sm text-slate-500 font-playfair italic">Curate the perfect mood for every stage of their journey.</p>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {getDaysArray().map((offset) => (
                        <div key={offset} className="p-5 bg-white rounded-[32px] border border-black/[0.03] shadow-sm space-y-3 group hover:border-sanctuary-secondary transition-all">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{offset === 0 ? "The Big Reveal" : `${offset} Days Before`}</label>
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-sanctuary-bg rounded-xl flex items-center justify-center text-sanctuary-primary shrink-0 group-hover:scale-110 transition-transform"><Music size={20} /></div>
                                <input type="text" value={config.spotifyTracks[`day${offset}`] || ""} onChange={(e) => updateConfig(`spotifyTracks.day${offset}`, e.target.value.split('/').pop()?.split('?')[0])} placeholder="Paste Spotify Link or ID" className="flex-grow p-3 rounded-xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none transition-colors text-sm bg-slate-50/50 text-gray-800" />
                            </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 text-left text-gray-800">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-serif-display text-slate-900">Shared Memories</h3>
                        <p className="text-sm text-slate-500 font-playfair italic">Upload photos that tell your story together.</p>
                    </div>
                    <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-8">
                        {getDaysArray().map((offset) => {
                          const dayKey = `day${offset}`;
                          const images = config.galleryImages?.[dayKey] || [];
                          return (
                            <div key={offset} className="p-6 bg-white rounded-[32px] border border-black/[0.03] shadow-sm space-y-4">
                              <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-bold text-sanctuary-primary uppercase tracking-[0.2em]">{offset === 0 ? "Grand Finale" : `${offset} Days Left`}</label>
                                <span className="text-[10px] bg-slate-50 px-2 py-1 rounded-full font-bold text-slate-400">{images.length} / {currentLimits.gallery}</span>
                              </div>
                              <div className="space-y-4">
                                <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-black/[0.05] rounded-2xl p-8 transition-all hover:border-sanctuary-primary cursor-pointer bg-slate-50 group ${uploading ? 'pointer-events-none' : ''}`}>
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-300 transition-all group-hover:text-sanctuary-primary">
                                        {uploading === `gallery_${dayKey}` ? <LucideLoader className="animate-spin text-sanctuary-primary" size={20} /> : <Plus size={20} />}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{uploading === `gallery_${dayKey}` ? 'Uploading...' : 'Add Photos'}</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, `gallery_${dayKey}`, true, dayKey)} />
                                </label>
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                                        {images.map((url, idx) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-black/[0.05] aspect-square bg-white shadow-sm">
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                                <button onClick={() => { const newImages = images.filter((_, i) => i !== idx); updateConfig(`galleryImages.${dayKey}`, newImages); if (url) deleteAsset(url); }} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={16} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 text-left text-gray-800">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif-display text-slate-900">Personal Notes</h3>
                    <p className="text-sm text-slate-500 font-playfair italic text-gray-800">Whisper sweet messages that reveal themselves over time.</p>
                  </div>
                  <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {config.notes.map((note, idx) => (
                        <div key={note.id} className="p-5 bg-white rounded-[32px] border border-black/[0.03] shadow-sm space-y-3 group hover:border-sanctuary-secondary transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-sanctuary-bg rounded-lg flex items-center justify-center text-sanctuary-primary"><MessageSquare size={12} /></div>
                                    <select value={note.day} onChange={(e) => { const newNotes = [...config.notes]; newNotes[idx].day = parseInt(e.target.value); updateConfig('notes', newNotes); }} className="p-1 rounded-lg border-none bg-transparent text-[10px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:text-sanctuary-primary cursor-pointer transition-colors">{getDaysArray().map(offset => ( <option key={offset} value={offset}>{offset === 0 ? "The Big Day" : `${offset} Days Left`}</option> ))}</select>
                                </div>
                                {config.notes.length > 1 && ( <button onClick={() => { const newNotes = config.notes.filter((_, i) => i !== idx); updateConfig('notes', newNotes); }} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-200 hover:bg-red-50 hover:text-red-500 transition-all"><X size={14} /></button> )}
                            </div>
                            <textarea value={note.content} onChange={(e) => { const newContent = e.target.value; const otherLen = config.notes.reduce((acc, n, i) => i === idx ? acc : acc + (n.content?.length || 0), 0); if (otherLen + newContent.length <= 8000) { const newNotes = [...config.notes]; newNotes[idx].content = newContent; updateConfig('notes', newNotes); } }} placeholder="Write your message here..." className="w-full p-4 bg-slate-50/50 rounded-2xl border-2 border-transparent focus:border-sanctuary-primary focus:bg-white outline-none text-sm min-h-[100px] resize-none transition-all" />
                        </div>
                    ))}
                    <button onClick={() => { const newNotes = [...config.notes, { id: `note${Date.now()}`, day: 0, content: '' }]; updateConfig('notes', newNotes); }} className="w-full py-5 border-2 border-dashed border-black/[0.05] text-slate-400 rounded-[32px] font-bold hover:bg-slate-50 hover:border-sanctuary-secondary/20 hover:text-sanctuary-primary transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={14} /> Add Another Message</button>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 text-left text-gray-800">
                  {!currentLimits.video ? (
                    <div className="p-12 text-center bg-sanctuary-primary/5 rounded-[40px] border-2 border-dashed border-sanctuary-secondary/30">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl mb-6 text-sanctuary-primary"><Eye size={32} /></div>
                        <h3 className="text-3xl font-serif-display text-slate-900 mb-2">Secret Cinema</h3>
                        <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed mb-8">The most intimate feature of Sanctuary. A private video theater that only reveals itself on the final day.</p>
                        <button onClick={() => setStep(1)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all">Unlock Premium Cinema</button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-serif-display text-slate-900">Secret Cinema</h3>
                        <p className="text-sm text-slate-500 font-playfair italic">Your personal video finale, locked until the very end.</p>
                      </div>
                      <div className={`relative rounded-[40px] border-2 border-dashed p-10 transition-all border-black/[0.05] bg-white hover:border-sanctuary-primary`}>
                        {config.videoUrl ? (
                            <div className="space-y-4">
                                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-black/[0.05] bg-black shadow-2xl relative group">
                                    <video src={config.videoUrl} className="w-full h-full object-cover" controls />
                                    <button onClick={() => { const url = config.videoUrl; updateConfig('videoUrl', ''); if (url) deleteAsset(url); }} className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:scale-110"><Trash2 size={18} /></button>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-sanctuary-primary uppercase tracking-[0.2em]"><Shield size={14} /> Video Secured</div>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-6 cursor-pointer">
                                <div className="w-20 h-20 bg-sanctuary-bg rounded-3xl flex items-center justify-center text-sanctuary-primary shadow-sm group-hover:scale-110 transition-all">
                                    {uploading === 'videoUrl' ? <LucideLoader className="animate-spin" size={32} /> : <Upload size={32} />}
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Select Video File</p>
                                    <p className="text-[10px] text-slate-400 italic font-medium">MP4 or MOV • Under 50MB recommended</p>
                                </div>
                                <input type="file" accept="video/*" className="hidden" disabled={!!uploading} onChange={(e) => handleFileUpload(e, 'videoUrl')} />
                            </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 7 && (
                <div className="space-y-12 text-center text-gray-800">
                   <div className="space-y-8 py-10">
                    <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center text-white mx-auto shadow-2xl transform rotate-3"><Lock size={40} /></div>
                    <div className="space-y-3">
                        <h3 className="text-4xl font-serif-display text-slate-900">Final Security Step</h3>
                        <p className="text-slate-500 font-playfair italic max-w-sm mx-auto leading-relaxed">Choose a 4-digit key. This will be the only way to unlock the most private parts of your sanctuary.</p>
                    </div>
                    <div className="max-w-[320px] mx-auto space-y-6">
                        <input type="text" maxLength={4} value={config.passcode} onChange={(e) => updateConfig('passcode', e.target.value.replace(/\D/g, ''))} className={`w-full p-8 text-center text-6xl tracking-[0.5em] font-serif-display rounded-[40px] border-4 transition-all outline-none border-black/[0.03] focus:border-sanctuary-primary focus:bg-white bg-slate-50 shadow-inner text-gray-800`} />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Encryption sequence ready</p>
                    </div>

                    {config.plan === 'spark' && !success && (
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                <button onClick={() => setSocialUnlock(false)} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${!socialUnlock ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Pay $1.99</button>
                                <button onClick={() => setSocialUnlock(true)} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${socialUnlock ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-400'}`}>TikTok Post (Free)</button>
                            </div>

                            {socialUnlock && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-cyan-50 rounded-[32px] border-2 border-cyan-100 space-y-4">
                                    <div className="flex items-center gap-3 text-cyan-600 font-bold uppercase tracking-widest text-xs">
                                        <Smartphone size={18} /> TikTok Verification
                                    </div>
                                    <p className="text-[11px] text-slate-500 italic leading-relaxed">
                                        Paste your TikTok post URL below. Make sure you tagged <span className="text-cyan-600 font-bold">@valentizewiz</span> in the description!
                                    </p>
                                    <input 
                                        type="text" 
                                        value={tiktokUrl} 
                                        onChange={(e) => setTiktokUrl(e.target.value)} 
                                        placeholder="https://www.tiktok.com/@user/video/..." 
                                        className="w-full p-4 bg-white rounded-xl border-2 border-cyan-100 focus:border-cyan-500 outline-none text-xs transition-all"
                                    />
                                    {socialError && (
                                        <div className="space-y-3">
                                            <p className="text-[10px] text-red-500 font-bold">{socialError}</p>
                                            <div className="p-3 bg-white/50 rounded-xl border border-red-100 space-y-2">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Troubleshooting Tips:</p>
                                                <ul className="text-[9px] text-slate-500 space-y-1 list-disc pl-3 italic">
                                                    <li>Ensure your TikTok account and post are <b>Public</b>.</li>
                                                    <li>The tag <b>@valentizewiz</b> must be in the <b>caption/description</b>, not comments.</li>
                                                    <li>TikTok may take a minute to update—try again in 60 seconds.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-10 text-center py-10 text-gray-800">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-2xl shadow-green-100/50 animate-in zoom-in duration-500"><CheckCircle2 size={48} /></div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce delay-700"><Sparkles className="text-amber-600" size={14} /></div>
                  </div>
                  <h2 className="text-6xl font-serif-display text-slate-900 tracking-tight leading-none">Sanctuary Built</h2>
                  
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="p-6 bg-slate-50 rounded-[32px] border-2 border-black/[0.03] break-all text-[10px] font-mono shadow-inner text-slate-500 text-center leading-relaxed relative group overflow-hidden">
                        {generatedLink}
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={copyToClipboard} className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"><Copy size={12} /> {copied ? 'Copied!' : 'Copy Link'}</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:scale-[1.02] transition-all text-sm uppercase tracking-widest">
                        {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />} {copied ? 'Link Copied to Clipboard' : 'Copy Sanctuary Link'}
                      </button>
                      
                      <div className="p-8 bg-sanctuary-bg rounded-[48px] border-2 border-black/[0.03] space-y-6 relative overflow-hidden group">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]"><Sparkles size={18} /> Social Media Pack</div>
                            <p className="text-sm text-slate-600 font-playfair italic leading-relaxed">Announce your gift with an aesthetic story card for TikTok or Instagram.</p>
                            <button onClick={downloadShareCard} disabled={isDownloading} className="w-full py-4 bg-white border-2 border-black/[0.05] text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50">
                                {isDownloading ? <LucideLoader className="animate-spin text-indigo-600" size={16} /> : <ImageIcon size={16} className="text-indigo-600" />} {isDownloading ? 'Generating...' : 'Download Story Card'}
                            </button>
                        </div>
                        <ThemeIcon className="absolute bottom-[-40px] right-[-40px] text-indigo-600/5 w-64 h-64 group-hover:scale-110 transition-transform duration-1000" />
                      </div>

                      <div className="p-8 bg-slate-50 rounded-[48px] border-2 border-black/[0.03] space-y-6 relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3 text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px]"><Mail size={18} /> Delivery Options</div>
                            {!emailSent ? (
                                <div className="space-y-4">
                                    <p className="text-[11px] text-slate-500 italic leading-relaxed">Never lose your link. Send a secure backup to your email.</p>
                                    <div className="flex gap-2">
                                        <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="your@email.com" className="flex-grow p-4 rounded-xl border-2 border-black/[0.05] text-xs focus:border-sanctuary-primary outline-none bg-white transition-all" />
                                        <button onClick={sendEmail} disabled={isSendingEmail || !userEmail} className="px-6 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-slate-800">{isSendingEmail ? <LucideLoader className="animate-spin" size={14} /> : 'Send'}</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-2xl border border-green-100"><CheckCircle2 size={20} /><span className="text-xs font-bold uppercase tracking-widest">Securely Sent to Inbox</span></div>
                            )}
                        </div>
                      </div>

                      <div className="flex justify-center gap-12 pt-10">
                        <button onClick={() => setStep(2)} className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold hover:text-slate-900 transition-colors">Edit Details</button>
                        <button onClick={handleDelete} className="text-[10px] text-red-300 uppercase tracking-[0.3em] font-bold hover:text-red-600 transition-colors flex items-center gap-2">Destroy <Trash2 size={10} /></button>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Render Target for Share Card */}
                  <div className="fixed left-[-9999px] top-0">
                    <div ref={cardRef} className="w-[1080px] h-[1920px] flex flex-col items-center justify-center p-20 text-center relative overflow-hidden" style={{ backgroundColor: activeTheme.colors.bg }}>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${activeTheme.colors.primary} 2px, transparent 2px)`, backgroundSize: '40px 40px' }} />
                        <div className="relative z-10 space-y-12">
                            <ThemeIcon size={240} fill={activeTheme.colors.primary} stroke={activeTheme.colors.primary} className="mx-auto" />
                            <h1 className="text-[120px] font-serif-display tracking-tight text-slate-900 leading-tight">A Sanctuary for {config.names.recipient}</h1>
                            <p className="text-[48px] text-slate-400 font-bold uppercase tracking-[0.3em] italic font-playfair">Hand-crafted by {config.names.sender}</p>
                            <div className="pt-24">
                                <div className="px-16 py-8 bg-slate-900 text-white rounded-[40px] text-[48px] font-bold shadow-2xl flex flex-col gap-2">
                                    <span>Open the Gift</span>
                                    <span className="text-[24px] opacity-60 font-normal lowercase tracking-widest">sanctuary-wizard.vercel.app</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-20 flex flex-col items-center gap-4">
                            <p className="text-[32px] font-bold text-slate-300 uppercase tracking-[0.4em]">The New Way to Give</p>
                            <div className="w-24 h-[1px] bg-slate-200" />
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 8 && (
          <div className="p-6 sm:p-10 bg-slate-50 border-t border-black/[0.03] flex justify-between items-center">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || !!uploading} className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-[0.2em] transition-all ${step === 1 || !!uploading ? 'text-slate-200' : 'text-slate-400 hover:text-slate-900'}`}><ArrowLeft size={16} /> Previous</button>
            <div className="flex gap-3">
                {step < 7 ? (
                    <button onClick={() => setStep(step + 1)} disabled={!!uploading} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                        {uploading ? 'Processing...' : 'Continue'} <ArrowRight size={16} />
                    </button>
                ) : (
                    <button onClick={handleGenerate} disabled={isPaying || isSocialVerifying || !!uploading} className={`${config.plan === 'spark' && socialUnlock && !success ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-sanctuary-primary'} text-white px-12 py-5 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all text-[10px] uppercase tracking-[0.3em] flex items-center gap-3`}>
                        {isPaying || isSocialVerifying ? <LucideLoader className="animate-spin" size={18} /> : success ? <Save size={18} /> : (config.plan === 'spark' && socialUnlock) ? <Smartphone size={18} /> : <Lock size={18} />}
                        {isPaying || isSocialVerifying ? 'Securing...' : success ? 'Generate' : (config.plan === 'spark' && socialUnlock) ? 'Verify & Secure' : `Pay & Secure`}
                    </button>
                )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isPreviewing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-white overflow-y-auto">
                <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl glass rounded-2xl flex justify-between items-center p-3 z-[3000] shadow-2xl border border-white/40 text-gray-800">
                    <div className="flex items-center gap-3 pl-2"><Sparkles className="text-sanctuary-primary" size={18} /><span className="text-xs font-bold uppercase tracking-widest text-slate-800">Live Preview</span></div>
                    <button onClick={() => { setIsPreviewing(false); setPreviewConfig(null); }} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"><ArrowLeft size={12} /> Exit Preview</button>
                </div>
                <div className="relative pt-16"><PreviewApp forceUpdateKey={previewRefreshKey} /></div>
            </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function PreviewApp({ forceUpdateKey }: { forceUpdateKey: number }) {
    const [phase, setPhase] = useState<'loading' | 'invitation' | 'dashboard'>('loading');

    useEffect(() => {
        const timer = setTimeout(() => setPhase('invitation'), 1500);
        return () => clearTimeout(timer);
    }, [forceUpdateKey]);

    if (phase === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] relative overflow-hidden text-gray-800">
                <video 
                    src="/videos/loading-background.mp4"
                    poster="/videos/loading-poster.jpg"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-20"
                />
                <LucideLoader className="w-8 h-8 text-slate-400 animate-spin relative z-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-800 text-left" key={forceUpdateKey}>
            {phase === 'invitation' ? <Invitation onComplete={() => setPhase('dashboard')} /> : <Dashboard />}
        </div>
    );
}

export default function WizardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center text-center relative overflow-hidden">
                <video 
                    src="/videos/loading-background.mp4"
                    poster="/videos/loading-poster.jpg"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-20"
                />
                <Sparkles className="text-sanctuary-primary animate-pulse relative z-10" size={48} />
            </div>
        }>
            <WizardContent />
        </Suspense>
    );
}
