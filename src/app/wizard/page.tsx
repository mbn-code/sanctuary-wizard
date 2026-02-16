"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Music, ImageIcon, MessageSquare, Lock, Save, Copy, Check, 
  ArrowRight, ArrowLeft, X, Sparkles, Star, Zap, Info, Loader2 as LucideLoader, 
  Plus, Trash2, FileText, Upload, Shield, Cake, Gift, Bell, GraduationCap, Baby, PartyPopper, CheckCircle2, User, Palette
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
    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
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
        if (navigator.share && navigator.canShare) {
            const blob = await fetch(dataUrl).then(res => res.blob());
            const file = new File([blob], 'gift-announcement.png', { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Gift Sanctuary',
                    text: 'I just created a digital sanctuary! ✨'
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
    { title: "The Video", icon: <ImageIcon /> },
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
        <main className="min-h-screen bg-sanctuary-bg flex flex-col items-center justify-center p-8 text-center text-gray-800">
            <div className="space-y-6 text-center">
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
                <h1 className="text-xl font-serif-display tracking-tight text-white">Sanctuary</h1>
                <p className="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em]">{config.plan} Plan • Step {step} of 8</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {step > 1 && step < 8 && (
                <button 
                    onClick={() => { setPreviewConfig(config); setIsPreviewing(true); }}
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

        <div className="flex-grow p-10 overflow-y-auto custom-scrollbar bg-sanctuary-bg/50 text-gray-800">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 text-left">
              {step === 1 && (
                <div className="space-y-8 text-center text-gray-800">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-serif-display text-slate-900">Choose your experience</h2>
                        <p className="text-slate-500 text-sm italic font-playfair">Pick the tier that fits your story.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                        {[
                            { id: 'spark', name: 'Spark', price: '$2.00', desc: 'The Sweet Teaser' },
                            { id: 'plus', name: 'Romance', price: '$7.00', desc: 'A Week of Memories' },
                            { id: 'infinite', name: 'Sanctuary', price: '$12.00', desc: 'The Full Journey' }
                        ].map((p) => (
                            <div key={p.id} onClick={() => updateConfig('plan', p.id)} className={`p-6 rounded-[32px] border-4 cursor-pointer transition-all flex flex-col text-center shadow-sm ${config.plan === p.id ? 'border-sanctuary-primary bg-white shadow-xl scale-[1.02]' : 'border-black/[0.03] bg-white hover:border-sanctuary-secondary/50'}`}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{p.name}</p>
                                <p className="text-3xl font-serif-display text-sanctuary-primary">{p.price}</p>
                                <p className="text-[10px] text-slate-500 mt-3 font-medium">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm text-left space-y-4">
                        <ul className="grid grid-cols-1 gap-3">
                            <li className="flex items-center gap-3 text-xs text-slate-600 font-medium text-left"><div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Check size={12} /></div> {config.plan === 'spark' ? '5 Messages' : config.plan === 'plus' ? '25 Messages' : '500 Messages'}</li>
                            <li className="flex items-center gap-3 text-xs text-slate-600 font-medium text-left"><div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Check size={12} /></div> {config.plan === 'spark' ? '1 Day Countdown' : config.plan === 'plus' ? '7 Day Countdown' : '14 Day Journey'}</li>
                            <li className="flex items-center gap-3 text-xs text-slate-600 font-medium text-left"><div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Check size={12} /></div> {config.plan === 'spark' ? '10 Photos' : config.plan === 'plus' ? '30 Photos' : '50 Photos'}</li>
                        </ul>
                    </div>
                    <button onClick={() => { setPreviewConfig(config); setIsPreviewing(true); }} className="w-full py-4 glass text-sanctuary-primary rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 border border-black/[0.05] shadow-sm">
                        <Zap size={14} className="fill-current" /> Preview Experience
                    </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 text-left text-gray-800">
                  <div className="space-y-4 text-left">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em] text-left">Select Occasion</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-left">
                        {OCCASIONS.map(o => (
                            <button
                                key={o.id}
                                onClick={() => {
                                    batchUpdateConfig({
                                        'occasion': o.id,
                                        'theme': o.theme,
                                        'customQuestion': o.question
                                    });
                                }}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-[10px] font-bold uppercase tracking-tight ${config.occasion === o.id ? 'border-sanctuary-primary bg-sanctuary-primary/5 text-sanctuary-primary shadow-inner' : 'border-black/[0.03] bg-white hover:border-sanctuary-secondary text-slate-500'}`}
                            >
                                {o.icon}
                                <span className="text-center line-clamp-1">{o.name}</span>
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-black/[0.03] text-left">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Select Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-left">
                        {Object.values(THEMES).map(t => (
                            <button
                                key={t.id}
                                onClick={() => updateConfig('theme', t.id)}
                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight ${config.theme === t.id ? 'border-sanctuary-primary bg-sanctuary-primary/5 text-sanctuary-primary' : 'border-black/[0.03] bg-white hover:border-sanctuary-secondary text-slate-500'}`}
                            >
                                <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: t.colors.primary }} />
                                {t.name}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-black/[0.03] text-left text-gray-800">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Personal Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">From</p>
                            <input type="text" value={config.names.sender} onChange={(e) => updateConfig('names.sender', e.target.value)} placeholder="Alex" className="w-full p-4 rounded-2xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none transition-colors bg-white shadow-sm text-gray-800 text-left" />
                        </div>
                        <div className="space-y-2 text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">To</p>
                            <input type="text" value={config.names.recipient} onChange={(e) => updateConfig('names.recipient', e.target.value)} placeholder="Sam" className="w-full p-4 rounded-2xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none transition-colors bg-white shadow-sm text-gray-800 text-left" />
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-left">
                    <div className="space-y-2 text-left">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            Event Date
                            <span className="group relative">
                                <Info size={12} className="text-slate-300" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-sans normal-case tracking-normal">The day your sanctuary fully unlocks.</span>
                            </span>
                        </label>
                        <input type="date" value={config.targetDate.split('T')[0]} onChange={(e) => updateConfig('targetDate', new Date(e.target.value).toISOString())} className="w-full p-4 rounded-2xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none bg-white shadow-sm text-gray-800 text-left" />
                    </div>
                    <div className="space-y-2 relative text-left">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Duration (Days)</label>
                        <input type="number" min={1} max={currentLimits.days} value={config.totalDays} onChange={(e) => { const val = parseInt(e.target.value); if (val <= currentLimits.days) { updateConfig('totalDays', val); } }} className="w-full p-4 rounded-xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none bg-white shadow-sm text-gray-800 text-left" />
                        <p className="text-[10px] text-slate-400 mt-1 italic text-left">Plan limit: {currentLimits.days} days</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-black/[0.03] text-left">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Custom Question</label>
                    <input type="text" value={config.customQuestion || ""} onChange={(e) => updateConfig('customQuestion', e.target.value)} placeholder="Will you be my Valentine?" className="w-full p-4 rounded-2xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none bg-white shadow-sm text-gray-800 text-left" />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-black/[0.03] text-left">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Custom Background</label>
                    <div className={`relative rounded-xl border-2 border-dashed p-6 transition-all border-black/[0.05] bg-white hover:border-sanctuary-primary cursor-pointer text-left`}>
                        {config.backgroundUrl ? (
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-sanctuary-secondary/20 shadow-sm bg-gray-50"><img src={config.backgroundUrl} alt="" className="w-full h-full object-cover" /></div>
                                <div className="flex-grow"><p className="text-xs font-bold text-sanctuary-primary text-left">Background Set</p><button onClick={() => { const url = config.backgroundUrl; updateConfig('backgroundUrl', ''); if (url) deleteAsset(url); }} className="text-[10px] text-sanctuary-soft underline uppercase font-bold hover:text-sanctuary-primary transition-colors text-left">Remove</button></div>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center gap-2 cursor-pointer text-left`}>
                                {uploading === 'backgroundUrl' ? <LucideLoader className="animate-spin text-sanctuary-primary" size={24} /> : <Upload className="text-sanctuary-secondary" size={24} />}
                                <span className="text-xs font-bold text-sanctuary-soft uppercase tracking-wider text-center">{uploading === 'backgroundUrl' ? 'Uploading...' : 'Upload Image'}</span>
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
                    <h3 className="text-2xl font-serif-display text-slate-900 text-left">Atmospheric Audio</h3>
                    <p className="text-sm text-slate-500 font-playfair italic text-left">Curate the perfect mood for every stage of their journey.</p>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-4 text-left">
                    {getDaysArray().map((offset) => (
                        <div key={offset} className="p-5 bg-white rounded-[32px] border border-black/[0.03] shadow-sm space-y-3 group hover:border-sanctuary-secondary transition-all text-left">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-left">{offset === 0 ? "The Big Reveal" : `${offset} Days Before`}</label>
                            <div className="flex gap-3 text-left">
                                <div className="w-12 h-12 bg-sanctuary-bg rounded-xl flex items-center justify-center text-sanctuary-primary shrink-0 group-hover:scale-110 transition-transform"><Music size={20} /></div>
                                <input type="text" value={config.spotifyTracks[`day${offset}`] || ""} onChange={(e) => updateConfig(`spotifyTracks.day${offset}`, e.target.value.split('/').pop()?.split('?')[0])} placeholder="Paste Spotify Link or ID" className="flex-grow p-3 rounded-xl border-2 border-black/[0.03] focus:border-sanctuary-primary outline-none transition-colors text-sm bg-slate-50/50 text-gray-800 text-left" />
                            </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 text-left text-gray-800">
                    <div className="space-y-2 text-left text-gray-800">
                        <h3 className="text-2xl font-serif-display text-slate-900 text-left">Shared Memories</h3>
                        <p className="text-sm text-slate-500 font-playfair italic text-left">Upload photos that tell your story together.</p>
                    </div>
                    <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-8 text-left text-gray-800">
                        {getDaysArray().map((offset) => {
                          const dayKey = `day${offset}`;
                          const images = config.galleryImages?.[dayKey] || [];
                          return (
                            <div key={offset} className="p-6 bg-white rounded-[32px] border border-black/[0.03] shadow-sm space-y-4 text-left text-gray-800">
                              <div className="flex justify-between items-center text-left text-gray-800">
                                <label className="block text-[10px] font-bold text-sanctuary-primary uppercase tracking-[0.2em] text-left">{offset === 0 ? "Grand Finale" : `${offset} Days Left`}</label>
                                <span className="text-[10px] bg-slate-50 px-2 py-1 rounded-full font-bold text-slate-400 text-left">{images.length} / {currentLimits.gallery}</span>
                              </div>
                              <div className="space-y-4 text-left text-gray-800">
                                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-black/[0.05] rounded-2xl p-8 transition-all hover:border-sanctuary-primary cursor-pointer bg-slate-50 group ${uploading ? 'pointer-events-none' : ''} text-left text-gray-800`}>
                                    {uploading === `gallery_${dayKey}` ? <LucideLoader className="animate-spin text-sanctuary-primary" size={24} /> : <Plus className="text-sanctuary-secondary group-hover:scale-110 transition-transform" size={24} />}
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{uploading === `gallery_${dayKey}` ? 'Uploading...' : 'Add Photos'}</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, `gallery_${dayKey}`, true, dayKey)} />
                                </label>
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-4 text-left text-gray-800">
                                        {images.map((url, idx) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-black/[0.05] aspect-square bg-white shadow-sm text-left text-gray-800">
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                                <button onClick={() => { const newImages = images.filter((_, i) => i !== idx); updateConfig(`galleryImages.${dayKey}`, newImages); if (url) deleteAsset(url); }} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-left"><Trash2 size={10} /></button>
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
                  <div className="space-y-2 text-left">
                    <h3 className="text-2xl font-serif-display text-slate-900 text-left">Personal Notes</h3>
                    <p className="text-sm text-slate-500 font-playfair italic text-left text-gray-800">Whisper sweet messages that reveal themselves over time.</p>
                  </div>
                  <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-left text-gray-800">
                    {config.notes.map((note, idx) => (
                        <div key={note.id} className="p-5 bg-white rounded-[32px] border border-black/[0.03] shadow-sm space-y-3 group hover:border-sanctuary-secondary transition-all text-left text-gray-800">
                            <div className="flex justify-between items-center text-left text-gray-800 text-left">
                                <select value={note.day} onChange={(e) => { const newNotes = [...config.notes]; newNotes[idx].day = parseInt(e.target.value); updateConfig('notes', newNotes); }} className="p-2 rounded-lg border border-black/[0.05] bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:border-sanctuary-primary text-gray-800">{getDaysArray().map(offset => ( <option key={offset} value={offset}>{offset === 0 ? "The Big Day" : `${offset} Days Left`}</option> ))}</select>
                                {config.notes.length > 1 && ( <button onClick={() => { const newNotes = config.notes.filter((_, i) => i !== idx); updateConfig('notes', newNotes); }} className="text-red-200 hover:text-red-500 transition-colors text-left"><X size={14} /></button> )}
                            </div>
                            <textarea value={note.content} onChange={(e) => { const newContent = e.target.value; const otherLen = config.notes.reduce((acc, n, i) => i === idx ? acc : acc + (n.content?.length || 0), 0); if (otherLen + newContent.length <= 8000) { const newNotes = [...config.notes]; newNotes[idx].content = newContent; updateConfig('notes', newNotes); } }} placeholder="Write your message here..." className="w-full p-3 bg-slate-50/50 rounded-xl border border-black/[0.03] focus:border-sanctuary-primary outline-none text-sm min-h-[80px] resize-none text-gray-800 text-left" />
                        </div>
                    ))}
                    <button onClick={() => { const newNotes = [...config.notes, { id: `note${Date.now()}`, day: 0, content: '' }]; updateConfig('notes', newNotes); }} className="w-full py-4 border-2 border-dashed border-black/[0.05] text-slate-400 rounded-[32px] font-bold hover:bg-slate-50 transition-all text-xs uppercase tracking-widest text-center">+ Add Another Message</button>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 text-left text-gray-800">
                  {!currentLimits.video ? (
                    <div className="p-12 text-center bg-sanctuary-primary/5 rounded-[40px] border-2 border-dashed border-sanctuary-secondary/30 text-center">
                        <ImageIcon size={48} className="mx-auto text-sanctuary-secondary mb-4 opacity-50 text-center" />
                        <h3 className="text-2xl font-serif-display text-slate-900 mb-2 text-center">Secret Cinema</h3>
                        <p className="text-sm text-slate-500 mb-8 font-playfair italic text-center">The ultimate finale. Upgrade to <b>The Sanctuary</b> plan to upload your own video.</p>
                        <button onClick={() => setStep(1)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg block mx-auto hover:scale-105 transition-all text-sm text-center">Upgrade Experience</button>
                    </div>
                  ) : (
                    <div className="space-y-6 text-left text-gray-800">
                      <div className="space-y-2 text-left">
                        <h3 className="text-2xl font-serif-display text-slate-900 text-left">Secret Cinema</h3>
                        <p className="text-sm text-slate-500 font-playfair italic text-left text-gray-800">Your personal video finale, locked until the very end.</p>
                      </div>
                      <div className={`relative rounded-[40px] border-2 border-dashed p-10 transition-all border-black/[0.05] bg-white hover:border-sanctuary-primary text-left`}>
                        {config.videoUrl ? (
                            <div className="space-y-4 text-left text-gray-800"><div className="aspect-video w-full rounded-3xl overflow-hidden border border-black/[0.05] bg-black shadow-2xl text-left"><video src={config.videoUrl} className="w-full h-full object-cover" controls /></div><div className="flex justify-between items-center text-left"><p className="text-[10px] font-bold text-sanctuary-primary uppercase tracking-[0.2em] text-left">Video Secured</p><button onClick={() => { const url = config.videoUrl; updateConfig('videoUrl', ''); if (url) deleteAsset(url); }} className="text-[10px] text-slate-400 underline uppercase font-bold hover:text-red-500 text-left">Remove</button></div></div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-6 cursor-pointer text-left">
                                {uploading === 'videoUrl' ? <LucideLoader className="animate-spin text-sanctuary-primary" size={32} /> : <div className="p-6 bg-sanctuary-bg rounded-3xl"><Upload className="text-sanctuary-primary" size={32} /></div>}
                                <div className="text-center space-y-2 text-left"><p className="text-sm font-bold text-slate-900 uppercase tracking-widest text-center">Select Video File</p><p className="text-[10px] text-slate-400 italic text-center">MP4 or MOV • Under 50MB recommended</p></div>
                                <input type="file" accept="video/*" className="hidden" disabled={!!uploading} onChange={(e) => handleFileUpload(e, 'videoUrl')} />
                            </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 7 && (
                <div className="space-y-8 text-center text-gray-800 text-center">
                   <div className="space-y-6 text-center text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl text-center"><Lock size={32} /></div>
                    <div className="space-y-2 text-center text-gray-800 text-center">
                        <h3 className="text-3xl font-serif-display text-slate-900 text-center">Set Your Passcode</h3>
                        <p className="text-sm text-slate-500 font-playfair italic text-center">A 4-digit key to unlock the most private parts of your sanctuary.</p>
                    </div>
                    <div className="max-w-[280px] mx-auto space-y-4 text-center text-center">
                        <input type="text" maxLength={4} value={config.passcode} onChange={(e) => updateConfig('passcode', e.target.value.replace(/\D/g, ''))} className={`w-full p-6 text-center text-5xl tracking-[0.5em] font-serif-display rounded-[32px] border-2 transition-all outline-none border-black/[0.03] focus:border-sanctuary-primary focus:bg-white bg-slate-50 shadow-inner text-gray-800 text-center`} />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Choose 4 numbers</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-8 text-center py-10 text-gray-800 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-xl shadow-green-100 text-center text-center"><Check size={40} /></div>
                  <h2 className="text-5xl font-serif-display text-slate-900 tracking-tight text-center">Sanctuary Ready</h2>
                  <div className="space-y-6 text-left text-gray-800">
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-black/[0.03] break-all text-xs font-mono shadow-inner text-slate-500 text-center text-center">{generatedLink}</div>
                    <div className="flex flex-col gap-4 text-left text-gray-800 text-left">
                      <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:scale-[1.02] transition-all text-center">
                        {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Copied!' : 'Copy Sanctuary Link'}
                      </button>
                      
                      <div className="p-8 bg-sanctuary-bg rounded-[40px] border border-black/[0.03] space-y-6 relative overflow-hidden text-left text-gray-800 text-left">
                        <div className="relative z-10 space-y-4 text-left text-gray-800 text-left">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px] text-left text-left"><Sparkles size={16} /> Social Media Pack</div>
                            <p className="text-sm text-slate-600 font-playfair italic leading-relaxed text-left text-left">Announce your gift with an aesthetic story card for TikTok or Instagram.</p>
                            <button onClick={downloadShareCard} disabled={isDownloading} className="w-full py-4 bg-white border border-black/[0.05] text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 text-left text-left">
                                {isDownloading ? <LucideLoader className="animate-spin text-indigo-600" size={16} /> : <ImageIcon size={16} className="text-indigo-600" />} {isDownloading ? 'Generating...' : 'Download Story Card'}
                            </button>
                        </div>
                        <ThemeIcon className="absolute bottom-[-30px] right-[-30px] text-indigo-600/5 w-48 h-48 text-left" />
                      </div>

                      <div className="p-8 bg-slate-50 rounded-[40px] border border-black/[0.03] space-y-6 relative overflow-hidden text-left text-gray-800 text-left">
                        <div className="relative z-10 space-y-4 text-left text-gray-800 text-left">
                            <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] text-left text-left"><Plus size={16} /> Delivery Options</div>
                            {!emailSent ? (
                                <div className="space-y-3 text-left text-gray-800 text-left">
                                    <p className="text-[11px] text-slate-500 italic text-left text-left">Never lose your link. Send a backup to your email.</p>
                                    <div className="flex gap-2 text-left text-left text-left">
                                        <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="your@email.com" className="flex-grow p-3 rounded-xl border border-black/[0.05] text-xs focus:border-sanctuary-primary outline-none bg-white text-gray-800 text-left text-left text-left" />
                                        <button onClick={sendEmail} disabled={isSendingEmail || !userEmail} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 text-center text-center text-center">{isSendingEmail ? <LucideLoader className="animate-spin" size={14} /> : 'Send'}</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100 text-left text-gray-800 text-left"><CheckCircle2 size={16} /><span className="text-[10px] font-bold uppercase text-left text-left">Sent to Inbox</span></div>
                            )}
                        </div>
                      </div>

                      <div className="flex justify-center gap-12 pt-6 text-center text-gray-800 text-center">
                        <button onClick={() => setStep(2)} className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold hover:text-slate-900 transition-colors text-center text-center">Edit Details</button>
                        <button onClick={handleDelete} className="text-[10px] text-red-300 uppercase tracking-[0.3em] font-bold hover:text-red-600 transition-colors text-center text-center">Destroy</button>
                      </div>
                    </div>
                  </div>
                  <div className="fixed left-[-9999px] top-0">
                    <div ref={cardRef} className="w-[1080px] h-[1920px] flex flex-col items-center justify-center p-20 text-center relative overflow-hidden" style={{ backgroundColor: activeTheme.colors.bg }}>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${activeTheme.colors.primary} 2px, transparent 2px)`, backgroundSize: '40px 40px' }} />
                        <div className="relative z-10 space-y-12 text-center text-gray-800">
                            <ThemeIcon size={240} fill={activeTheme.colors.primary} stroke={activeTheme.colors.primary} className="mx-auto text-center" />
                            <h1 className="text-[120px] font-serif-display tracking-tight text-slate-900 leading-tight text-center">A Sanctuary for {config.names.recipient}</h1>
                            <p className="text-[48px] text-slate-400 font-bold uppercase tracking-[0.3em] text-center italic font-playfair">Hand-crafted by {config.names.sender}</p>
                            <div className="pt-24 text-center">
                                <div className="px-16 py-8 bg-slate-900 text-white rounded-[40px] text-[48px] font-bold shadow-2xl text-center flex flex-col gap-2">
                                    <span>Open the Gift ✨</span>
                                    <span className="text-[24px] opacity-60 font-normal">sanctuary-wizard.vercel.app</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-20 flex flex-col items-center gap-4">
                            <p className="text-[32px] font-bold text-slate-300 uppercase tracking-[0.4em] text-center">The New Way to Give</p>
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
          <div className="p-8 bg-slate-50/50 border-t border-black/[0.03] flex justify-between items-center text-gray-800 text-center text-gray-800">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || !!uploading} className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${step === 1 || !!uploading ? 'text-slate-200' : 'text-slate-400 hover:text-slate-900'} text-center`}><ArrowLeft size={16} /> Prev</button>
            <div className="flex gap-3 text-center text-gray-800 text-center">
                {step < 7 ? (
                    <button onClick={() => setStep(step + 1)} disabled={!!uploading} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 text-center text-center">
                        {uploading ? 'Working...' : 'Continue'} <ArrowRight size={16} className="inline ml-1 text-center" />
                    </button>
                ) : (
                    <button onClick={handleGenerate} disabled={isPaying || !!uploading} className="bg-sanctuary-primary text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 text-center text-center text-white text-center">
                        {isPaying ? <div className="animate-spin text-white text-center inline-block text-center text-center"><Sparkles size={18} /></div> : success ? <Save size={18} /> : <Lock size={18} />}
                        {isPaying ? 'Processing' : success ? 'Generate' : `Secure Pay`}
                    </button>
                )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isPreviewing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-white overflow-y-auto text-center text-gray-800">
                <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl glass rounded-2xl flex justify-between items-center p-3 z-[3000] shadow-2xl border border-white/40 text-gray-800 text-center">
                    <div className="flex items-center gap-3 pl-2 text-gray-800 text-center"><Sparkles className="text-sanctuary-primary" size={18} /><span className="text-xs font-bold uppercase tracking-widest text-slate-800 text-left text-left">Live Preview</span></div>
                    <button onClick={() => { setIsPreviewing(false); setPreviewConfig(null); }} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 text-center text-white text-center text-center"><ArrowLeft size={12} /> Exit Preview</button>
                </div>
                <div className="relative pt-16 text-gray-800 text-left text-left text-left text-left"><PreviewApp forceUpdateKey={previewRefreshKey} /></div>
            </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function PreviewApp({ forceUpdateKey }: { forceUpdateKey: number }) {
    const [phase, setPhase] = useState<'invitation' | 'dashboard'>('invitation');
    return (
        <div className="min-h-screen text-gray-800 text-left text-left text-left text-left text-left" key={forceUpdateKey}>
            {phase === 'invitation' ? <Invitation onComplete={() => setPhase('dashboard')} /> : <Dashboard />}
        </div>
    );
}

export default function WizardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-center text-center text-center"><Sparkles className="text-sanctuary-primary animate-pulse text-center text-center text-center" size={48} /></div>}>
            <WizardContent />
        </Suspense>
    );
}
