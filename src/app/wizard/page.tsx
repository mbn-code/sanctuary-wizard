"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, ImageIcon, MessageSquare, Lock, Save, Copy, Check, ArrowRight, ArrowLeft, X, Sparkles, Star, Zap, Info, Loader2 as LucideLoader, Plus, Trash2, FileText, Upload, Shield, Cake, Gift } from 'lucide-react';
import { SanctuaryConfig, SanctuaryPayload } from '@/utils/config';
import { generateMasterKey, exportKey, encryptData, deriveKeyFromPasscode, toBase64URL } from '@/utils/crypto';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { useSanctuary } from '@/utils/SanctuaryContext';
import Dashboard from '@/components/Dashboard';
import Invitation from '@/components/Invitation';
import { THEMES } from '@/utils/themes';

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
  const [uploading, setUploading] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState<{ [key: string]: string }>({});
  
  const { setPreviewConfig } = useSanctuary();
  
  const [config, setConfig] = useState<SanctuaryConfig>({
    plan: initialPlan,
    theme: 'valentine',
    occasion: 'valentine',
    names: { sender: '', recipient: '' },
    targetDate: new Date().toISOString().split('T')[0],
    anniversaryDate: new Date().toISOString().split('T')[0],
    totalDays: initialPlan === 'spark' ? 1 : 3,
    spotifyTracks: { "day0": "" },
    notes: [
      { id: 'note1', day: 0, content: 'Happy Valentine\'s Day!' }
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
    const newConfig = { ...config };
    const parts = path.split('.');
    let current: any = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setConfig(newConfig);
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
            alert(`Limit of ${currentLimits.gallery} photos reached.`);
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

  if (isVerifying) {
      return (
        <main className="min-h-screen bg-sanctuary-bg flex flex-col items-center justify-center p-8 text-center text-gray-800">
            <div className="space-y-6">
                <LucideLoader className="w-16 h-16 text-sanctuary-primary animate-spin mx-auto" />
                <h2 className="text-2xl font-bold font-sacramento text-4xl">Securing your gift...</h2>
            </div>
        </main>
      );
  }

  return (
    <main className="min-h-screen bg-sanctuary-bg p-4 md:p-8 flex flex-col items-center text-gray-800">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[650px]">
        {/* Header */}
        <div className="bg-sanctuary-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
                {steps[step-1]?.icon}
            </div>
            <div>
                <h1 className="text-xl font-bold">Magic Gift</h1>
                <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest">{config.plan} Plan • Step {step} of 8</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && step < 8 && (
                <button 
                    onClick={() => {
                        setPreviewConfig(config);
                        setIsPreviewing(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[10px] text-white font-bold uppercase tracking-widest border border-white/20"
                >
                    <Zap size={14} className="fill-current" /> Preview
                </button>
            )}
            <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors text-white">
                <X size={24} />
            </Link>
          </div>
        </div>

        <div className="h-1 bg-white/20 w-full flex">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <div 
              key={s} 
              className={`h-full transition-all duration-500 ${s <= step ? 'bg-white' : ''}`} 
              style={{ width: '12.5%' }}
            />
          ))}
        </div>

        <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="space-y-6 text-center text-gray-800">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-sanctuary-primary font-sacramento text-4xl">Choose your experience</h2>
                        <p className="text-sanctuary-soft text-sm mt-1">Pick the tier that fits your story.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        {[
                            { id: 'spark', name: 'Spark', price: '$2.00', desc: 'The Sweet Teaser' },
                            { id: 'plus', name: 'Romance', price: '$7.00', desc: 'A Week of Memories' },
                            { id: 'infinite', name: 'Sanctuary', price: '$12.00', desc: 'The Full Journey' }
                        ].map((p) => (
                            <div 
                                key={p.id}
                                onClick={() => updateConfig('plan', p.id)}
                                className={`p-4 rounded-2xl border-4 cursor-pointer transition-all flex flex-col text-center ${config.plan === p.id ? 'border-sanctuary-primary bg-sanctuary-primary/5 shadow-inner' : 'border-sanctuary-secondary/10 hover:border-sanctuary-secondary/30'}`}
                            >
                                <p className="text-[10px] font-bold text-sanctuary-soft uppercase tracking-tighter mb-1">{p.name}</p>
                                <p className="text-xl font-bold text-sanctuary-primary">{p.price}</p>
                                <p className="text-[10px] text-sanctuary-soft mt-2">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-sanctuary-bg/50 p-4 rounded-2xl text-left">
                        <ul className="text-xs text-sanctuary-soft space-y-2">
                            <li className="flex items-center gap-2">
                                <Check size={14} className="text-green-500" /> 
                                {config.plan === 'spark' ? '5 Messages' : config.plan === 'plus' ? '25 Messages' : '500 Messages'}
                            </li>
                            <li className="flex items-center gap-2 text-gray-800">
                                <Check size={14} className="text-green-500 text-gray-800" /> 
                                {config.plan === 'spark' ? '1 Day Countdown' : config.plan === 'plus' ? '7 Day Countdown' : '14 Day Journey'}
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={14} className="text-green-500" /> 
                                {config.plan === 'spark' ? '10 Photos' : config.plan === 'plus' ? '30 Photos' : '50 Photos'}
                            </li>
                        </ul>
                    </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 text-left">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-sanctuary-soft uppercase tracking-widest">Choose a Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.values(THEMES).map(t => (
                            <button
                                key={t.id}
                                onClick={() => updateConfig('theme', t.id)}
                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 text-xs font-bold ${config.theme === t.id ? 'border-sanctuary-primary bg-sanctuary-primary/5' : 'border-gray-100 hover:border-sanctuary-secondary'}`}
                            >
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                                {t.name}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-sanctuary-soft uppercase tracking-widest">Your Name</label>
                      <input 
                        type="text" 
                        value={config.names.sender}
                        onChange={(e) => updateConfig('names.sender', e.target.value)}
                        placeholder="Alex"
                        className="w-full p-3 rounded-xl border-2 border-sanctuary-secondary/20 focus:border-sanctuary-primary outline-none transition-colors bg-white text-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-sanctuary-soft uppercase tracking-widest">Their Name</label>
                      <input 
                        type="text" 
                        value={config.names.recipient}
                        onChange={(e) => updateConfig('names.recipient', e.target.value)}
                        placeholder="Sam"
                        className="w-full p-3 rounded-xl border-2 border-sanctuary-secondary/20 focus:border-sanctuary-primary outline-none transition-colors bg-white text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                        <label className="block text-xs font-bold text-sanctuary-soft uppercase tracking-widest">Target Date</label>
                        <input 
                        type="date" 
                        value={config.targetDate.split('T')[0]}
                        onChange={(e) => updateConfig('targetDate', new Date(e.target.value).toISOString())}
                        className="w-full p-3 rounded-xl border-2 border-sanctuary-secondary/20 focus:border-sanctuary-primary outline-none transition-colors bg-white text-gray-800"
                        />
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="block text-xs font-bold text-sanctuary-soft uppercase tracking-widest">Question</label>
                        <input 
                        type="text" 
                        value={config.customQuestion || ""}
                        onChange={(e) => updateConfig('customQuestion', e.target.value)}
                        placeholder="Will you be my Valentine?"
                        className="w-full p-3 rounded-xl border-2 border-sanctuary-secondary/20 focus:border-sanctuary-primary outline-none transition-colors bg-white text-gray-800"
                        />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 text-left">
                  <p className="text-sm text-sanctuary-soft">Attach Spotify tracks to each countdown stage.</p>
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {getDaysArray().map((offset) => (
                        <div key={offset} className="space-y-2 p-4 bg-sanctuary-bg/30 rounded-xl">
                        <label className="block text-[10px] font-bold text-sanctuary-soft uppercase tracking-wider">
                            {offset === 0 ? "The Big Day" : `${offset} Days Before`}
                        </label>
                        <input 
                            type="text" 
                            value={config.spotifyTracks[`day${offset}`] || ""}
                            onChange={(e) => updateConfig(`spotifyTracks.day${offset}`, e.target.value.split('/').pop()?.split('?')[0])}
                            placeholder="Paste Spotify Link or ID"
                            className="w-full p-3 rounded-lg border-2 border-sanctuary-secondary/20 focus:border-sanctuary-primary outline-none transition-colors text-sm bg-white"
                        />
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 text-left">
                    <p className="text-sm text-sanctuary-soft">Upload images for each stage of the journey.</p>
                    <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-8">
                        {getDaysArray().map((offset) => {
                          const dayKey = `day${offset}`;
                          const images = config.galleryImages?.[dayKey] || [];
                          return (
                            <div key={offset} className="p-5 bg-sanctuary-bg/30 rounded-2xl space-y-4 border border-sanctuary-secondary/10">
                              <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-bold text-sanctuary-primary uppercase tracking-[0.2em]">
                                  {offset === 0 ? "Grand Finale" : `${offset} Days Left`}
                                </label>
                                <span className="text-[10px] bg-white px-2 py-1 rounded-full font-bold text-sanctuary-soft shadow-sm">
                                    {images.length} Photos
                                </span>
                              </div>
                              <div className="space-y-4">
                                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-sanctuary-secondary/30 rounded-xl p-6 transition-all hover:border-sanctuary-primary cursor-pointer bg-white/50 group ${uploading ? 'pointer-events-none' : ''}`}>
                                    {uploading === `gallery_${dayKey}` ? (
                                        <LucideLoader className="animate-spin text-sanctuary-primary" size={24} />
                                    ) : (
                                        <Plus className="text-sanctuary-secondary group-hover:scale-110 transition-transform" size={24} />
                                    )}
                                    <span className="text-xs font-bold text-sanctuary-soft uppercase tracking-wider">
                                        {uploading === `gallery_${dayKey}` ? 'Uploading...' : 'Select Photos'}
                                    </span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        className="hidden" 
                                        onChange={(e) => handleFileUpload(e, `gallery_${dayKey}`, true, dayKey)}
                                    />
                                </label>
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        {images.map((url, idx) => (
                                            <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-sanctuary-secondary/20 aspect-square bg-white shadow-sm">
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                                <button 
                                                    onClick={() => {
                                                        const newImages = images.filter((_, i) => i !== idx);
                                                        updateConfig(`galleryImages.${dayKey}`, newImages);
                                                        if (url) deleteAsset(url);
                                                    }}
                                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={10} />
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
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-left text-gray-800">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-sanctuary-soft font-bold uppercase tracking-wider">Secret Messages</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${totalNotesLength > 7500 ? 'bg-red-100 text-red-600' : 'bg-sanctuary-bg text-sanctuary-soft'}`}>
                        {totalNotesLength.toLocaleString()} / 8,000
                      </span>
                    </div>
                  </div>
                  
                  {config.notes.map((note, idx) => (
                    <div key={note.id} className="p-4 bg-sanctuary-bg/50 rounded-2xl space-y-3 relative group border border-sanctuary-secondary/10 shadow-sm">
                      <div className="flex gap-4">
                        <select 
                          value={note.day}
                          onChange={(e) => {
                            const newNotes = [...config.notes];
                            newNotes[idx].day = parseInt(e.target.value);
                            updateConfig('notes', newNotes);
                          }}
                          className="p-2 rounded-lg border-2 border-sanctuary-secondary/20 outline-none text-xs bg-white focus:border-sanctuary-primary"
                        >
                          {getDaysArray().map(offset => (
                              <option key={offset} value={offset}>{offset === 0 ? "The Big Day" : `${offset} Days Left`}</option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          value={note.content}
                          onChange={(e) => {
                            const newContent = e.target.value;
                            const otherLen = config.notes.reduce((acc, n, i) => i === idx ? acc : acc + (n.content?.length || 0), 0);
                            if (otherLen + newContent.length <= 8000) {
                                const newNotes = [...config.notes];
                                newNotes[idx].content = newContent;
                                updateConfig('notes', newNotes);
                            }
                          }}
                          placeholder="My message..."
                          className="flex-grow p-2 rounded-lg border-2 border-sanctuary-secondary/20 outline-none text-sm bg-white focus:border-sanctuary-primary"
                        />
                      </div>
                      {config.notes.length > 1 && (
                        <button 
                          onClick={() => {
                              const newNotes = config.notes.filter((_, i) => i !== idx);
                              updateConfig('notes', newNotes);
                          }}
                          className="absolute -top-2 -right-2 bg-sanctuary-primary text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                        const newNotes = [...config.notes, { id: `note${Date.now()}`, day: 0, content: '' }];
                        updateConfig('notes', newNotes);
                    }}
                    className="w-full py-3 border-2 border-dashed border-sanctuary-primary text-sanctuary-primary rounded-2xl font-bold hover:bg-sanctuary-primary/5 transition-colors text-sm"
                  >
                    + Add Another Message
                  </button>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4 text-left">
                  {!currentLimits.video ? (
                    <div className="p-8 text-center bg-sanctuary-primary/5 rounded-3xl border-2 border-dashed border-sanctuary-secondary/30">
                      <ImageIcon size={48} className="mx-auto text-sanctuary-secondary mb-4" />
                      <h3 className="text-xl font-bold text-sanctuary-primary mb-2">Secret Cinema is Premium</h3>
                      <p className="text-sm text-sanctuary-soft mb-6">Upgrade to <b>The Sanctuary</b> plan to upload your own video.</p>
                      <button onClick={() => setStep(1)} className="px-6 py-2 bg-sanctuary-primary text-white rounded-full font-bold shadow-lg block mx-auto">View Plans</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-sanctuary-soft uppercase tracking-widest">Secret Cinema Video</label>
                      <div className={`relative rounded-xl border-2 border-dashed p-8 transition-all ${uploading === 'videoUrl' ? 'bg-sanctuary-bg/30 border-sanctuary-primary' : 'border-sanctuary-secondary/30 bg-white hover:border-sanctuary-primary'}`}>
                        {config.videoUrl ? (
                            <div className="space-y-4 text-left">
                                <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-sanctuary-secondary/20 bg-black">
                                    <video src={config.videoUrl} className="w-full h-full object-cover" controls />
                                </div>
                                <div className="flex justify-between items-center text-left">
                                    <p className="text-[10px] font-bold text-sanctuary-primary uppercase">Video Uploaded</p>
                                    <button onClick={() => {
                                        const url = config.videoUrl;
                                        updateConfig('videoUrl', '');
                                        if (url) deleteAsset(url);
                                    }} className="text-[10px] text-sanctuary-soft underline uppercase font-bold hover:text-sanctuary-primary">Change</button>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-4 cursor-pointer">
                                {uploading === 'videoUrl' ? (
                                    <LucideLoader className="animate-spin text-sanctuary-primary" size={32} />
                                ) : (
                                    <div className="p-4 bg-sanctuary-primary/5 rounded-full">
                                        <Upload className="text-sanctuary-primary" size={32} />
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-sm font-bold text-sanctuary-primary uppercase tracking-wider">Upload Video</p>
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
                <div className="space-y-4 text-center">
                   <div className="space-y-2 text-left">
                    <label className="block text-sm font-bold text-sanctuary-soft uppercase tracking-wider">Passcode</label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={config.passcode}
                      onChange={(e) => updateConfig('passcode', e.target.value.replace(/\D/g, ''))}
                      className={`w-full p-4 text-center text-4xl tracking-widest font-bold rounded-xl border-2 transition-all outline-none border-sanctuary-secondary/20 focus:border-sanctuary-primary focus:bg-white bg-gray-50`}
                    />
                    <p className="text-[10px] text-sanctuary-soft text-center font-bold uppercase tracking-widest">Choose 4 numbers to lock your gift.</p>
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-8 text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Check size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-sanctuary-primary font-sacramento text-5xl">Gift Ready</h2>
                  <div className="space-y-4 text-left">
                    <div className="p-4 bg-sanctuary-bg rounded-xl border-2 border-sanctuary-secondary/20 break-all text-xs font-mono bg-gray-50 overflow-hidden shadow-inner">
                      {generatedLink}
                    </div>
                    <div className="flex flex-col gap-3">
                      <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-2 py-4 bg-sanctuary-primary text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all">
                        {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Copied!' : 'Copy Gift Link'}
                      </button>
                      <button onClick={() => setStep(2)} className="w-full py-2 text-center text-[10px] text-sanctuary-soft uppercase tracking-widest font-bold hover:text-sanctuary-primary">Edit Sanctuary</button>
                      <button onClick={handleDelete} className="w-full py-2 text-center text-[10px] text-red-400 uppercase tracking-widest font-bold hover:text-red-600">Destroy Sanctuary</button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 8 && (
          <div className="p-6 bg-sanctuary-bg/30 border-t flex justify-between items-center text-gray-800">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || !!uploading} className={`flex items-center gap-2 font-bold text-sm ${step === 1 || !!uploading ? 'text-sanctuary-soft/50 cursor-not-allowed' : 'text-sanctuary-soft hover:text-sanctuary-primary'}`}>
              <ArrowLeft size={18} /> Previous
            </button>
            <div className="flex gap-2">
                {step < 7 ? (
                    <button onClick={() => setStep(step + 1)} disabled={!!uploading} className="bg-sanctuary-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-sm disabled:opacity-50">
                        {uploading ? 'Uploading...' : 'Next Step'} <ArrowRight size={18} />
                    </button>
                ) : (
                    <button onClick={handleGenerate} disabled={isPaying || !!uploading} className="bg-sanctuary-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-sm disabled:opacity-50">
                        {isPaying ? <div className="animate-spin"><Sparkles size={18} /></div> : success ? <Save size={18} /> : <Lock size={18} />}
                        {isPaying ? 'Redirecting...' : success ? 'Finish Sanctuary' : `Pay & Finalize`}
                    </button>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Preview Overlay */}
      <AnimatePresence>
        {isPreviewing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-sanctuary-bg overflow-y-auto">
                <div className="fixed top-4 left-4 right-4 p-2 bg-white/95 backdrop-blur-md border-2 border-sanctuary-primary rounded-2xl flex justify-between items-center z-[3000] shadow-2xl">
                    <div className="flex items-center gap-2 pl-2"><Sparkles className="text-sanctuary-primary" size={18} /> <span className="text-xs font-bold text-sanctuary-primary uppercase tracking-widest">Live Preview</span></div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setIsPreviewing(false); setPreviewConfig(null); }} className="px-6 py-2 bg-sanctuary-primary text-white rounded-xl font-bold shadow-lg text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <ArrowLeft size={14} /> Exit Preview
                        </button>
                    </div>
                </div>
                <div className="relative pt-16">
                    <PreviewApp forceUpdateKey={previewRefreshKey} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function PreviewApp({ forceUpdateKey }: { forceUpdateKey: number }) {
    const [phase, setPhase] = useState<'invitation' | 'dashboard'>('invitation');
    return (
        <div className="min-h-screen text-gray-800" key={forceUpdateKey}>
            {phase === 'invitation' ? <Invitation onComplete={() => setPhase('dashboard')} /> : <Dashboard />}
        </div>
    );
}

export default function WizardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-sanctuary-bg flex items-center justify-center"><Heart className="text-sanctuary-primary animate-pulse" size={48} /></div>}>
            <WizardContent />
        </Suspense>
    );
}
