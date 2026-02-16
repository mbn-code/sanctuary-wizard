"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Invitation from '@/components/Invitation';
import Dashboard from '@/components/Dashboard';
import MySanctuaries from '@/components/MySanctuaries';
import VisitorCounter from '@/components/VisitorCounter';
import { useSanctuary } from '@/utils/SanctuaryContext';
import Link from 'next/link';
import HeroVisual from '@/components/HeroVisual';
import { 
  Heart, Check, Sparkles, Star, Zap, Music, ImageIcon, 
  MessageSquare, X, Shield, Lock, ArrowLeft, Loader2 as LucideLoader, 
  Clock, Gift, Cake, Moon, Sun, Camera, Eye, User, GraduationCap, Play, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [phase, setPhase] = useState<'invitation' | 'dashboard' | 'loading'>('loading');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const { config, setPreviewConfig } = useSanctuary();
  const [isClient, setIsClient] = useState(false);

  const [currentActivity, setCurrentActivity] = useState(0);
  const activities = [
    { type: 'Birthday Sanctuary', location: 'Copenhagen', time: '12m ago', icon: <Cake size={12} /> },
    { type: 'Anniversary Gift', location: 'London', time: '45m ago', icon: <Heart size={12} /> },
    { type: 'Wedding Sanctuary', location: 'New York', time: '2h ago', icon: <Star size={12} /> },
    { type: 'Graduation Gift', location: 'Berlin', time: '5h ago', icon: <GraduationCap size={12} /> },
    { type: 'Digital Sanctuary', location: 'Paris', time: '1d ago', icon: <Shield size={12} /> },
    { type: 'Birthday Sanctuary', location: 'Tokyo', time: '2d ago', icon: <Cake size={12} /> },
  ];

  useEffect(() => {
    setIsClient(true);
    const aTimer = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
    }, 45000);

    return () => clearInterval(aTimer);
  }, [activities.length]);

  useEffect(() => {
    if (!isClient) return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const hasUrlConfig = searchParams.get('d') && window.location.hash;

    if (!hasUrlConfig && !config) {
        setPhase('loading');
        return;
    }

    const isCompleted = localStorage.getItem(`sanctuary_completed_${JSON.stringify(config?.names)}`) === 'true';
    
    if (isCompleted) {
      setPhase('dashboard');
    } else {
      setPhase('invitation');
    }
  }, [config, isClient]);

  const isRealSanctuary = isClient && !!(new URLSearchParams(window.location.search).get('d') && window.location.hash);

  const startDemo = (occasion: 'birthday' | 'anniversary' | 'graduation' | 'classic' | 'team') => {
    const configs: Record<string, any> = {
        birthday: {
            plan: 'infinite', theme: 'celebration', occasion: 'birthday',
            names: { sender: "Jordan", recipient: "Taylor" },
            targetDate: new Date().toISOString(), anniversaryDate: "1995-06-15T00:00:00",
            totalDays: 3, customQuestion: "Ready for your birthday surprise?",
            spotifyTracks: { "day0": "5In99v09ZvxrkZST00Id06" },
            notes: [{ id: "n1", day: 0, content: "Happy 30th! You don't look a day over 21." }],
            passcode: "1234", galleryImages: { "day0": ["https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=800&q=80"] }
        },
        anniversary: {
            plan: 'infinite', theme: 'classic', occasion: 'anniversary',
            names: { sender: "Alex", recipient: "Sam" },
            targetDate: new Date().toISOString(), anniversaryDate: "2019-10-12T00:00:00",
            totalDays: 7, customQuestion: "Will you go on another 100 adventures with me?",
            spotifyTracks: { "day0": "4u7EnebtpSjSfbv6XfPv9K" },
            notes: [{ id: "n1", day: 0, content: "Five years down, forever to go." }],
            passcode: "1012", galleryImages: { "day0": ["https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"] }
        },
        team: {
            plan: 'plus', theme: 'minimalist', occasion: 'team',
            names: { sender: "Design Ops", recipient: "The Team" },
            targetDate: new Date().toISOString(), anniversaryDate: new Date().toISOString(),
            totalDays: 1, customQuestion: "Thank you for an incredible quarter.",
            spotifyTracks: { "day0": "7pBrj98S4vI96N9N7YpYpA" },
            notes: [{ id: "n1", day: 0, content: "Thank you for all your hard work this quarter!" }],
            passcode: "2025", galleryImages: { "day0": ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"] }
        }
    };
    setPreviewConfig(configs[occasion] || configs.anniversary);
    setPreviewRefreshKey(prev => prev + 1);
    setIsPreviewing(true);
  };

  if (!isRealSanctuary || isPreviewing) {
    return (
      <main className="min-h-screen bg-[#FDFCFB] text-slate-900 overflow-x-hidden selection:bg-sanctuary-secondary selection:text-sanctuary-primary flex flex-col">
        <AnimatePresence>
            {isPreviewing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-white overflow-y-auto">
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl glass rounded-2xl flex justify-between items-center p-3 z-[3000] shadow-2xl border border-white/40 text-gray-800">
                        <div className="flex items-center gap-3 pl-2">
                            <div className="w-8 h-8 bg-sanctuary-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-sanctuary-primary/20">
                                <Sparkles size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-800">Experience Demo</span>
                        </div>
                        <button onClick={() => { setIsPreviewing(false); setPreviewConfig(null); }} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                            <ArrowLeft size={12} /> Exit Demo
                        </button>
                    </div>
                    <div className="relative"><PreviewApp forceUpdateKey={previewRefreshKey} /></div>
                </motion.div>
            )}
        </AnimatePresence>

        <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-[100] backdrop-blur-sm bg-white/30 border-b border-black/5">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold italic">S</div>
                <span className="font-serif-display text-xl tracking-tighter text-slate-900">Sanctuary</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-[10px] uppercase font-bold tracking-widest text-slate-500 font-sans">
                <button onClick={() => document.getElementById('bento')?.scrollIntoView({behavior:'smooth'})} className="hover:text-slate-900 transition-colors">Experience</button>
                <button onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})} className="hover:text-slate-900 transition-colors">Pricing</button>
                <Link href="/wizard" className="px-5 py-2 bg-slate-900 text-white rounded-full hover:scale-105 transition-all shadow-xl shadow-slate-900/10">Start Creating</Link>
            </div>
        </nav>

        <header className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
            <div className="fixed top-24 right-6 md:right-8 z-[60] pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentActivity}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-black/5 flex items-center gap-3 w-fit text-gray-800 ml-auto"
                    >
                        <div className="flex items-center justify-center w-5 h-5 bg-slate-100 rounded-full text-slate-400">
                            {activities[currentActivity].icon}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-sans">
                            {activities[currentActivity].type} created in <span className="text-slate-900">{activities[currentActivity].location}</span>
                            <span className="ml-2 text-slate-400 font-medium normal-case tracking-normal">— {activities[currentActivity].time}</span>
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.8 }}
                    className="space-y-8 text-center lg:text-left relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-sanctuary-primary mb-4 shadow-sm border-white/60 mx-auto lg:mx-0 font-sans">
                        <Sparkles size={12} className="animate-pulse" /> A New Way to Give
                    </div>
                    <h1 className="text-6xl md:text-8xl xl:text-9xl font-serif-display tracking-tight text-slate-900 leading-[0.9] lg:max-w-2xl">
                        Don't just give. <br /> 
                        <span className="text-sanctuary-primary italic pr-4">Build a Sanctuary.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-xl mx-auto lg:mx-0 font-playfair italic leading-relaxed">
                        The ultimate digital sanctuary for life's biggest moments. <br className="hidden md:block" />
                        Photos, music, and secret messages that unlock over time.
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link href="/wizard" className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-lg font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-3 justify-center group font-sans uppercase tracking-widest">
                            <Zap className="fill-white group-hover:scale-110 transition-transform" size={20} /> Create Yours
                        </Link>
                        <button onClick={() => startDemo('anniversary')} className="px-10 py-5 glass text-slate-900 rounded-2xl text-lg font-bold hover:bg-white/60 transition-all flex items-center gap-3 justify-center border border-black/5 font-sans uppercase tracking-widest">
                            <Eye size={20} /> See Demo
                        </button>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative flex justify-center items-center lg:justify-end"
                >
                    <HeroVisual />
                </motion.div>
            </div>

            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sanctuary-secondary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        </header>

        <MySanctuaries />

        {/* Bento Section */}
        <section id="bento" className="py-32 px-6 bg-slate-50/50 relative overflow-hidden">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
                {/* Row 1: 8 + 4 */}
                <div className="md:col-span-12 lg:col-span-8 bg-white p-10 rounded-[40px] shadow-sm border border-black/[0.03] flex flex-col justify-between group overflow-hidden relative">
                    <div className="relative z-10 space-y-4 text-left text-gray-800">
                        <h3 className="text-4xl font-serif-display text-slate-900">The Journey Matters</h3>
                        <p className="text-slate-500 max-w-md text-sm font-playfair italic">Build anticipation with a timed countdown. Every day reveals a new photo, a hidden note, or a curated song.</p>
                    </div>
                    <div className="flex gap-3 mt-8 relative z-10 text-left text-gray-800">
                        {[7, 6, 5, 4, 3, 2, 1].map(d => (
                            <div key={d} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm transition-all border ${d === 1 ? 'bg-sanctuary-primary text-white border-sanctuary-primary scale-110 shadow-lg shadow-sanctuary-primary/20' : 'bg-slate-50 text-slate-400 border-black/5 group-hover:translate-y-[-4px]'}`} style={{ transitionDelay: `${d * 50}ms` }}>{d}</div>
                        ))}
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-sanctuary-secondary/10 rounded-full blur-[80px]" />
                </div>

                <div className="md:col-span-6 lg:col-span-4 bg-slate-900 p-10 rounded-[40px] shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group">
                    <div className="relative z-10 space-y-4 text-left">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"><Shield size={20} className="text-sanctuary-secondary" /></div>
                        <h3 className="text-3xl font-serif-display">Private by Design</h3>
                        <p className="text-white/60 text-sm leading-relaxed font-playfair italic">No database. Zero tracking. Your memories are encrypted and live only in your unique link.</p>
                    </div>
                    <div className="absolute bottom-[-20px] right-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="font-mono text-[8px] leading-tight select-none pointer-events-none">
                            {Array.from({length: 20}).map((_, i) => (
                                <div key={i} className="whitespace-nowrap">AES_256_GCM_{Math.random().toString(36).substring(7)}</div>
                            ))}
                        </div>
                    </div>
                    <Lock className="absolute bottom-[-20px] right-[-20px] text-white/5 w-40 h-40 group-hover:scale-110 transition-transform duration-700" />
                </div>

                {/* Row 2: 4 + 8 */}
                <div className="md:col-span-6 lg:col-span-4 bg-white p-10 rounded-[40px] shadow-sm border border-black/[0.03] flex flex-col justify-between overflow-hidden group relative">
                    <div className="space-y-4 text-left">
                        <h3 className="text-3xl font-serif-display text-slate-900">Tactile Memories</h3>
                        <p className="text-slate-500 text-sm font-playfair italic">Photos hidden behind interactive scratch-off layers. Reveal the past with your touch.</p>
                    </div>
                    <div className="relative mt-4">
                        <div className="w-32 h-32 bg-slate-100 rounded-3xl border-4 border-white shadow-xl rotate-[-6deg] group-hover:rotate-0 transition-all duration-500 overflow-hidden mx-auto">
                            <div className="absolute inset-0 bg-sanctuary-secondary/40 flex items-center justify-center text-slate-900 font-bold uppercase tracking-widest text-[8px]">Reveal</div>
                            <div className="absolute top-0 left-0 w-full h-full bg-slate-50 group-hover:translate-x-full transition-transform duration-700 shadow-xl" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-sanctuary-primary group-hover:scale-110 transition-all border border-black/5">
                            <ImageIcon size={16} />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-12 lg:col-span-8 bg-[#F5F3FF] p-10 rounded-[40px] shadow-sm border border-black/[0.03] flex flex-col justify-between group overflow-hidden relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full text-left">
                        <div className="space-y-4 text-left">
                            <h3 className="text-3xl font-serif-display text-slate-900">Premium Cinema</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-playfair italic">The ultimate finale. A private theater for your personal video montage, locked behind a custom passcode.</p>
                            <div className="flex gap-2 text-left">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-10 bg-white rounded-lg border border-black/5 shadow-sm text-left flex items-center justify-center"><div className="w-1 h-1 bg-slate-200 rounded-full" /></div>)}
                            </div>
                        </div>
                        <div className="h-full aspect-video bg-slate-900 rounded-3xl shadow-2xl relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                            <video 
                                src="/videos/hero-sanctuary.mp4" 
                                poster="/videos/hero-poster.jpg"
                                autoPlay 
                                muted 
                                loop 
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-all">
                                    <Zap className="text-white fill-white" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: 4 + 4 + 4 */}
                <div className="md:col-span-12 lg:col-span-4 bg-amber-50 p-10 rounded-[40px] shadow-sm border border-amber-100 flex flex-col justify-between overflow-hidden group relative text-left">
                    <VisitorCounter />
                </div>

                <div className="md:col-span-6 lg:col-span-4 bg-white p-10 rounded-[40px] shadow-sm border border-black/[0.03] flex flex-col justify-between overflow-hidden group relative text-left">
                    <div className="space-y-4 text-left">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-left"><Music className="text-sanctuary-primary" size={20} /></div>
                        <h3 className="text-2xl font-serif-display text-slate-900">Atmospheric Audio</h3>
                        <p className="text-slate-500 text-xs leading-relaxed font-playfair italic">Curate the perfect mood with integrated Spotify tracks for every stage of the journey.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-black/[0.03] flex items-center gap-3 mt-4 group-hover:border-sanctuary-secondary/30 transition-colors">
                        <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-sanctuary-primary"><Play size={12} fill="currentColor" /></div>
                        <div className="flex-grow space-y-1">
                            <div className="h-1.5 w-24 bg-slate-200 rounded-full" />
                            <div className="h-1 w-16 bg-slate-100 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-6 lg:col-span-4 bg-indigo-50 p-10 rounded-[40px] shadow-sm border border-indigo-100 flex flex-col justify-between overflow-hidden group relative text-left">
                    <div className="space-y-4 text-left">
                        <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-left"><Camera className="text-indigo-600" size={20} /></div>
                        <h3 className="text-2xl font-serif-display text-slate-900">Story Ready</h3>
                        <p className="text-slate-500 text-xs leading-relaxed font-playfair italic">Announce your gift with aesthetic story cards for TikTok or Instagram.</p>
                    </div>
                    <div className="flex justify-center mt-4">
                        <div className="relative w-20 h-32 bg-white rounded-xl shadow-2xl border border-indigo-100 overflow-hidden transform rotate-[-8deg] group-hover:rotate-0 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
                            <div className="absolute top-4 left-4 right-4 h-1 bg-indigo-100 rounded-full" />
                            <div className="absolute bottom-4 left-4 right-4 h-8 bg-slate-900 rounded-lg flex items-center justify-center"><Smartphone size={10} className="text-white" /></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="pricing" className="py-32 px-6 bg-slate-50/50">
            <div className="max-w-6xl mx-auto text-center space-y-16">
                <div className="space-y-4">
                    <h2 className="text-5xl md:text-6xl font-serif-display text-slate-900">A Tier for Every Story</h2>
                    <p className="text-slate-500 font-playfair italic">Choose the depth of your sanctuary experience.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { id: 'spark', name: 'The Spark', price: '2', icon: <Zap size={24} />, features: ['1 Day Journey', '5 Messages', '10 Photos'], missing: ['No Custom Background', 'With Branding', 'No Secret Cinema'] },
                        { id: 'plus', name: 'The Romance', price: '7', icon: <Heart size={24} />, features: ['7 Day Journey', '25 Messages', '30 Photos', 'Custom Background', 'No Watermark'], missing: ['No Secret Cinema'], popular: true },
                        { id: 'infinite', name: 'The Sanctuary', price: '12', icon: <Star size={24} />, features: ['14 Day Journey', 'Unlimited Messages', '50 Photos', 'Private Video Cinema', 'No Watermark'], missing: [] }
                    ].map((p) => (
                        <div 
                            key={p.id}
                            className={`p-10 rounded-[40px] border-2 transition-all flex flex-col justify-between text-left ${p.popular ? 'bg-white border-sanctuary-primary shadow-2xl scale-105 z-10' : 'bg-white/50 border-black/[0.03] hover:border-sanctuary-secondary'}`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${p.popular ? 'bg-sanctuary-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        {p.icon}
                                    </div>
                                    {p.popular && <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Most Popular</span>}
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">{p.name}</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-xl font-bold text-slate-400">$</span>
                                    <span className="text-6xl font-serif-display text-slate-900 leading-none">{p.price}</span>
                                    <span className="text-xs text-slate-400 font-medium ml-2 font-sans uppercase tracking-widest">one-time</span>
                                </div>
                                <ul className="space-y-4 mb-12">
                                    {p.features.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                            <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Check size={12} strokeWidth={3} /></div>
                                            {f}
                                        </li>
                                    ))}
                                    {p.missing.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-slate-300 font-medium opacity-60">
                                            <div className="w-5 h-5 flex items-center justify-center"><X size={12} strokeWidth={3} /></div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Link href={`/wizard?plan=${p.id}`} className={`w-full py-5 text-center rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${p.popular ? 'bg-slate-900 text-white shadow-xl hover:scale-[1.02]' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>Choose {p.name}</Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-32 px-6 bg-white text-left">
            <div className="max-w-3xl mx-auto space-y-12">
                <h2 className="text-4xl font-serif-display text-center text-slate-900">FAQ</h2>
                <div className="divide-y divide-black/5">
                    {[
                        { q: "How is it so secure?", a: "We use AES-GCM 256-bit encryption. The decryption key is generated in your browser and appended to the URL fragment (#). It is never sent to our servers." },
                        { q: "Can I edit it later?", a: "Yes. In the final step of the wizard, you can click 'Edit Details' to update your configuration and generate a new link." },
                        { q: "What happens to my uploads?", a: "All photos and videos are stored securely on Vercel Blob. You can wipe all your data permanently using the Revoke page." }
                    ].map(f => (
                        <div key={f.q} className="py-8 space-y-3">
                            <h4 className="font-bold text-slate-900">{f.q}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed font-playfair italic">{f.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <footer className="py-20 border-t border-black/5 bg-slate-50/50">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-900">
                        <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] italic">S</div>
                        <span className="font-serif-display text-lg tracking-tighter">Sanctuary</span>
                    </div>
                    <p className="text-xs max-w-xs italic leading-relaxed font-playfair">"I built this to turn digital gifts into emotional sanctuaries. Built with love in Denmark, for lovers everywhere."</p>
                </div>
                <div className="flex flex-wrap gap-x-12 gap-y-4 text-[10px] uppercase font-bold tracking-[0.2em] md:justify-end md:items-end">
                    <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
                    <Link href="/revoke" className="hover:text-red-500 transition-colors">Revoke</Link>
                    <a href="mailto:malthe@mbn-code.dk" className="hover:text-slate-900 lowercase font-sans transition-colors tracking-normal">malthe@mbn-code.dk</a>
                </div>
            </div>
        </footer>
      </main>
    );
  }

  if (phase === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FDFCFB] relative overflow-hidden text-gray-800">
        <video 
          src="/videos/loading-background.mp4"
          poster="/videos/loading-poster.jpg"
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover blur-md opacity-20"
        />
        <div className="relative z-10">
          <LucideLoader className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="text-gray-800">
      {phase === 'invitation' ? (
        <Invitation onComplete={() => {
          localStorage.setItem(`sanctuary_completed_${JSON.stringify(config?.names)}`, 'true');
          setPhase('dashboard');
        }} />
      ) : (
        <Dashboard />
      )}
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
