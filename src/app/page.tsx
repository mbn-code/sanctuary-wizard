"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Invitation from '@/components/Invitation';
import Dashboard from '@/components/Dashboard';
import MySanctuaries from '@/components/MySanctuaries';
import VisitorCounter from '@/components/VisitorCounter';
import { useSanctuary } from '@/utils/SanctuaryContext';
import Link from 'next/link';
import { 
  Heart, Check, Sparkles, Star, Zap, Music, ImageIcon, 
  MessageSquare, X, Shield, Lock, ArrowLeft, Loader2 as LucideLoader, 
  Clock, Gift, Cake, Moon, Sun, Camera, Eye, User
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
    { type: 'Birthday Sanctuary', location: 'Copenhagen', time: '12m ago' },
    { type: 'Anniversary Gift', location: 'London', time: '45m ago' },
    { type: 'Wedding Sanctuary', location: 'New York', time: '2h ago' },
    { type: 'Graduation Gift', location: 'Berlin', time: '5h ago' },
    { type: 'Digital Sanctuary', location: 'Paris', time: '1d ago' },
    { type: 'Birthday Sanctuary', location: 'Tokyo', time: '2d ago' },
  ];

  useEffect(() => {
    setIsClient(true);
    const aTimer = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
    }, 45000);

    return () => {
      clearInterval(aTimer);
    };
  }, [activities.length]);

  useEffect(() => {
    if (!isClient) return;
    
    // We only care about the URL-based config here
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

  // Determine if we should show the landing page
  const searchParams = isClient ? new URLSearchParams(window.location.search) : null;
  const isRealSanctuary = !!(isClient && searchParams?.get('d') && window.location.hash);

  const startDemo = (occasion: 'birthday' | 'anniversary' | 'graduation' | 'classic' | 'team') => {
    const configs: Record<string, any> = {
        birthday: {
            plan: 'infinite', theme: 'celebration', occasion: 'birthday',
            names: { sender: "Jordan", recipient: "Taylor" },
            targetDate: new Date().toISOString(), anniversaryDate: "1995-06-15T00:00:00",
            totalDays: 3, customQuestion: "Ready for your birthday surprise?",
            spotifyTracks: { "day0": "5In99v09ZvxrkZST00Id06" },
            notes: [{ id: "n1", day: 0, content: "Happy 30th! You don't look a day over 21. 🎂" }],
            passcode: "1234", galleryImages: { "day0": ["https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=800&q=80"] }
        },
        anniversary: {
            plan: 'infinite', theme: 'lavender', occasion: 'anniversary',
            names: { sender: "Alex", recipient: "Sam" },
            targetDate: new Date().toISOString(), anniversaryDate: "2020-02-14T00:00:00",
            totalDays: 7, customQuestion: "Happy 5 years, my love.",
            spotifyTracks: { "day0": "4riDfclV7kPDT9D58FpmHd" },
            notes: [{ id: "n1", day: 0, content: "Five years down, forever to go. ❤️" }],
            passcode: "0214", galleryImages: { "day0": ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"] }
        },
        team: {
            plan: 'infinite', theme: 'minimalist', occasion: 'team',
            names: { sender: "Management", recipient: "The Team" },
            targetDate: new Date().toISOString(), anniversaryDate: new Date().toISOString(),
            totalDays: 1, customQuestion: "A small token of our appreciation.",
            spotifyTracks: { "day0": "27NovPIB6S9899v969oSvF" },
            notes: [{ id: "n1", day: 0, content: "Thank you for all your hard work this quarter! 🚀" }],
            passcode: "2026", galleryImages: { "day0": ["https://images.unsplash.com/photo-1522071823991-b1ae5e6a3048?auto=format&fit=crop&w=800&q=80"] }
        }
    };
    setPreviewConfig(configs[occasion] || configs.anniversary);
    setIsPreviewing(true);
  };

  if (!isRealSanctuary || isPreviewing) {
    if (isPreviewing || !isRealSanctuary) {
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
                <div className="hidden md:flex items-center gap-8 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <button onClick={() => document.getElementById('bento')?.scrollIntoView({behavior:'smooth'})} className="hover:text-slate-900 transition-colors">Experience</button>
                    <button onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})} className="hover:text-slate-900 transition-colors">Pricing</button>
                    <Link href="/wizard" className="px-5 py-2 bg-slate-900 text-white rounded-full hover:scale-105 transition-all shadow-xl shadow-slate-900/10">Start Creating</Link>
                </div>
            </nav>

            <header className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 relative text-center">
                <div className="fixed top-24 right-6 md:right-8 z-[60] pointer-events-none">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentActivity}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-black/5 flex items-center gap-3 w-fit text-gray-800 ml-auto"
                        >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                {activities[currentActivity].type} created in <span className="text-slate-900">{activities[currentActivity].location}</span>
                                <span className="ml-2 text-slate-400 font-medium normal-case tracking-normal">— {activities[currentActivity].time}</span>
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sanctuary-secondary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-8 text-gray-800">
                    <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-sanctuary-primary mb-4 shadow-sm border-white/60 mx-auto">
                        <Sparkles size={12} className="animate-pulse" /> A New Way to Give
                    </div>
                    <h1 className="text-7xl md:text-9xl font-serif-display tracking-tight text-slate-900 leading-[0.9]">Don't just give. <br /> <span className="text-sanctuary-primary italic pr-4">Build a Sanctuary.</span></h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-playfair italic leading-relaxed">
                        The ultimate digital sanctuary for life's biggest moments. <br className="hidden md:block" />
                        Photos, music, and secret messages that unlock over time.
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/wizard" className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-3 justify-center group">
                            <Zap className="fill-white group-hover:scale-110 transition-transform" size={24} /> Create Yours
                        </Link>
                        <button onClick={() => startDemo('anniversary')} className="px-12 py-5 glass text-slate-900 rounded-2xl text-xl font-bold hover:bg-white/60 transition-all flex items-center gap-3 justify-center border border-black/5">
                            <Eye size={24} /> See Demo
                        </button>
                    </div>
                </motion.div>
            </header>

            <MySanctuaries />

            {/* Bento Section */}
            <section id="bento" className="py-32 px-6 bg-slate-50/50 relative overflow-hidden">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
                    {/* Row 1: 8 + 4 */}
                    <div className="md:col-span-12 lg:col-span-8 bg-white p-10 rounded-[40px] shadow-sm border border-black/[0.03] flex flex-col justify-between group overflow-hidden relative">
                        <div className="relative z-10 space-y-4 text-left text-gray-800">
                            <h3 className="text-4xl font-serif-display text-slate-900">The Journey Matters</h3>
                            <p className="text-slate-500 max-w-md text-sm">Build anticipation with a timed countdown. Every day reveals a new photo, a hidden note, or a curated song.</p>
                        </div>
                        <div className="flex gap-3 mt-8 relative z-10 text-left text-gray-800">
                            {[7, 6, 5, 4, 3, 2, 1].map(d => (
                                <div key={d} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm transition-all border ${d === 1 ? 'bg-sanctuary-primary text-white border-sanctuary-primary scale-110' : 'bg-slate-50 text-slate-400 border-black/5 group-hover:translate-y-[-4px]'}`} style={{ transitionDelay: `${d * 50}ms` }}>{d}</div>
                            ))}
                        </div>
                        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-sanctuary-secondary/10 rounded-full blur-[80px]" />
                    </div>

                    <div className="md:col-span-6 lg:col-span-4 bg-slate-900 p-10 rounded-[40px] shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group text-gray-800">
                        <div className="relative z-10 space-y-4 text-left text-white">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-left text-white"><Shield size={20} className="text-sanctuary-secondary" /></div>
                            <h3 className="text-3xl font-serif-display text-left">Private by Design</h3>
                            <p className="text-white/60 text-sm leading-relaxed text-left text-gray-800 text-white">No database. Zero tracking. Your memories are encrypted and live only in your unique link.</p>
                        </div>
                        <Lock className="absolute bottom-[-20px] right-[-20px] text-white/5 w-40 h-40 group-hover:scale-110 transition-transform duration-700" />
                    </div>

                    {/* Row 2: 4 + 8 */}
                    <div className="md:col-span-6 lg:col-span-4 bg-white p-10 rounded-[40px] shadow-sm border border-black/[0.03] flex flex-col justify-between overflow-hidden group relative">
                        <div className="space-y-4 text-left text-gray-800">
                            <h3 className="text-3xl font-serif-display text-slate-900">Tactile Memories</h3>
                            <p className="text-slate-500 text-sm">Photos hidden behind an interactive scratch-off layer. Reveal the past with your touch.</p>
                        </div>
                        <div className="w-full h-32 bg-slate-100 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-sanctuary-secondary/40 flex items-center justify-center text-slate-900 font-bold uppercase tracking-widest text-[10px]">Scratch Me</div>
                            <div className="absolute top-0 left-0 w-1/2 h-full bg-white group-hover:translate-x-full transition-transform duration-1000 shadow-xl" />
                        </div>
                    </div>

                    <div className="md:col-span-12 lg:col-span-8 bg-[#F5F3FF] p-10 rounded-[40px] shadow-sm border border-black/[0.03] flex flex-col justify-between group overflow-hidden relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full text-left">
                            <div className="space-y-4 text-left">
                                <h3 className="text-3xl font-serif-display text-slate-900">Premium Cinema</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">The ultimate finale. A private theater for your personal video montage, locked behind a custom passcode.</p>
                                <div className="flex gap-2 text-left">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-10 bg-white rounded-lg border border-black/5 shadow-sm text-left" />)}
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
                            <p className="text-slate-500 text-xs leading-relaxed">Curate the perfect mood with integrated Spotify tracks for every stage of the journey.</p>
                        </div>
                        <div className="w-full h-12 bg-slate-50 rounded-xl border border-black/[0.03] flex items-center px-4 gap-3 mt-4">
                            <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
                            <div className="h-2 w-24 bg-slate-100 rounded-full" />
                        </div>
                    </div>

                    <div className="md:col-span-6 lg:col-span-4 bg-indigo-50 p-10 rounded-[40px] shadow-sm border border-indigo-100 flex flex-col justify-between overflow-hidden group relative text-left">
                        <div className="space-y-4 text-left">
                            <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-left"><Camera className="text-indigo-600" size={20} /></div>
                            <h3 className="text-2xl font-serif-display text-slate-900">Story Ready</h3>
                            <p className="text-slate-500 text-xs leading-relaxed">Download high-res aesthetic story cards to announce your gift on TikTok or Instagram.</p>
                        </div>
                        <div className="w-16 h-20 bg-white rounded-lg shadow-lg border border-indigo-100 mx-auto rotate-6 group-hover:rotate-0 transition-all duration-500 mt-4" />
                    </div>
                </div>
            </section>


            <section className="py-32 px-6 bg-white">
                <div className="max-w-6xl mx-auto space-y-20">
                    <div className="text-center space-y-4 text-gray-800">
                        <h2 className="text-5xl font-serif-display text-slate-900">Crafted in Minutes</h2>
                        <p className="text-slate-500 font-playfair italic">Simple process, high-end results.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative text-left text-gray-800">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-black/[0.03] -z-10 text-gray-800" />
                        {[
                            { step: '01', title: 'Personalize', desc: 'Choose a theme and add your shared music, photos, and secret notes.', icon: <Sparkles className="text-sanctuary-primary" /> },
                            { step: '02', title: 'Secure', desc: 'Your data is encrypted end-to-end. We generate a private key just for you.', icon: <Lock className="text-sanctuary-primary" /> },
                            { step: '03', title: 'Surprise', desc: 'Send the unique link and watch them reveal their digital sanctuary.', icon: <Gift className="text-sanctuary-primary" /> }
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 p-10 rounded-[40px] border border-black/[0.03] space-y-6 relative group hover:bg-white hover:shadow-2xl transition-all duration-500 text-left text-gray-800">
                                <div className="text-4xl font-serif-display text-slate-200 group-hover:text-sanctuary-secondary transition-colors text-left text-gray-800">{item.step}</div>
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-left text-gray-800">{item.icon}</div>
                                <div className="space-y-2 text-left text-gray-800">
                                    <h4 className="text-xl font-bold text-slate-900 text-left">{item.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed text-left">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-32 px-6 bg-white text-center text-gray-800">
                <div className="max-w-4xl mx-auto space-y-16 text-center text-gray-800">
                    <h2 className="text-5xl md:text-7xl font-serif-display text-slate-900 tracking-tighter text-center text-gray-800">One Link. <br /> Infinite Occasions.</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-gray-800">
                        {[
                            { id: 'anniversary', name: 'Anniversary', icon: <Heart size={20} />, col: 'bg-red-50 text-red-600' },
                            { id: 'birthday', name: 'Birthday', icon: <Cake size={20} />, col: 'bg-amber-50 text-amber-600' },
                            { id: 'graduation', name: 'Graduation', icon: <Star size={20} />, col: 'bg-indigo-50 text-indigo-600' },
                            { id: 'classic', name: 'Wedding', icon: <Moon size={20} />, col: 'bg-slate-50 text-slate-600' },
                            { id: 'team', name: 'Team / Office', icon: <User size={20} />, col: 'bg-emerald-50 text-emerald-600' }
                        ].map(o => (
                            <button key={o.id} onClick={() => startDemo(o.id as any)} className={`p-8 rounded-[32px] ${o.col} flex flex-col items-center gap-4 hover:scale-[1.02] transition-all font-bold text-xs uppercase tracking-widest border border-black/5 text-center`}>
                                {o.icon} {o.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-32 px-6 bg-slate-50/50 text-gray-800">
                <div className="max-w-6xl mx-auto text-center space-y-16 text-gray-800">
                    <h2 className="text-5xl font-serif-display text-slate-900 text-center">A Tier for Every Story</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-gray-800">
                        {[
                            { id: 'spark', name: 'The Spark', price: '$2', desc: '1 Day Countdown • 5 Messages • 10 Photos', primary: false },
                            { id: 'plus', name: 'The Romance', price: '$7', desc: '7 Day Countdown • 25 Messages • 30 Photos • Custom Background • No Watermark', primary: true },
                            { id: 'infinite', name: 'The Sanctuary', price: '$12', desc: '14 Day Journey • Unlimited Messages • 50 Photos • Private Video Cinema', primary: false }
                        ].map(p => (
                            <div key={p.id} className={`p-10 rounded-[40px] border-2 text-left flex flex-col justify-between transition-all ${p.primary ? 'bg-white border-sanctuary-primary shadow-2xl scale-105 z-10' : 'bg-white border-black/5 hover:border-sanctuary-secondary'}`}>
                                <div className="text-left text-gray-800">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 text-left text-gray-800">{p.name}</p>
                                    <h4 className="text-5xl font-serif-display text-slate-900 mb-6 text-left text-gray-800">{p.price}</h4>
                                    <ul className="space-y-4 text-left text-gray-800">
                                        {p.desc.split(' • ').map(f => (
                                            <li key={f} className="flex items-center gap-3 text-sm text-slate-500 font-medium text-left text-gray-800">
                                                <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Check size={12} /></div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link href={`/wizard?plan=${p.id}`} className={`w-full py-4 text-center rounded-2xl font-bold mt-12 transition-all ${p.primary ? 'bg-slate-900 text-white hover:scale-[1.02]' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>Choose {p.name}</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-32 px-6 bg-white text-left text-gray-800">
                <div className="max-w-3xl mx-auto space-y-12 text-left text-gray-800">
                    <h2 className="text-4xl font-serif-display text-center text-slate-900">FAQ</h2>
                    <div className="divide-y divide-black/5 text-left text-gray-800">
                        {[
                            { q: "How is it so secure?", a: "We use AES-GCM 256-bit encryption. The decryption key is generated in your browser and appended to the URL fragment (#). It is never sent to our servers." },
                            { q: "Can I edit it later?", a: "Yes. In the final step of the wizard, you can click 'Edit Details' to update your configuration and generate a new link." },
                            { q: "What happens to my uploads?", a: "All photos and videos are stored securely on Vercel Blob. You can wipe all your data permanently using the Revoke page." }
                        ].map(f => (
                            <div key={f.q} className="py-8 space-y-3 text-left text-gray-800">
                                <h4 className="font-bold text-slate-900 text-left text-gray-800">{f.q}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed text-left text-gray-800">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-20 border-t border-black/5 bg-slate-50/50 text-gray-800">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400 text-left text-gray-800">
                    <div className="space-y-6 text-left text-gray-800">
                        <div className="flex items-center gap-2 text-slate-900 text-left text-gray-800">
                            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] italic text-left text-gray-800">S</div>
                            <span className="font-serif-display text-lg tracking-tighter text-left text-gray-800">Sanctuary</span>
                        </div>
                        <p className="text-xs max-w-xs italic leading-relaxed text-left text-gray-800 text-left text-gray-800">"I built this to turn digital gifts into emotional sanctuaries. Built with love in Denmark, for lovers everywhere."</p>
                    </div>
                    <div className="flex gap-12 text-[10px] uppercase font-bold tracking-[0.2em] justify-end items-end text-gray-800 text-left text-gray-800">
                        <Link href="/privacy" className="hover:text-slate-900 text-gray-800 text-left text-gray-800">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-900 text-gray-800 text-left text-gray-800">Terms</Link>
                        <Link href="/revoke" className="hover:text-red-500 text-gray-800 text-left text-gray-800">Revoke</Link>
                        <a href="mailto:malthe@mbn-code.dk" className="hover:text-slate-900 lowercase font-sans text-gray-800 text-left text-gray-800">malthe@mbn-code.dk</a>
                    </div>
                </div>
            </footer>
          </main>
        );
    }
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
