"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Invitation from '@/components/Invitation';
import Dashboard from '@/components/Dashboard';
import { useSanctuary } from '@/utils/SanctuaryContext';
import Link from 'next/link';
import { Heart, Check, Sparkles, Star, Zap, Music, ImageIcon, MessageSquare, Infinity as InfinityIcon, X, Shield, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [phase, setPhase] = useState<'invitation' | 'dashboard' | 'loading'>('loading');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const { config, setPreviewConfig } = useSanctuary();

  useEffect(() => {
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
  }, [config]);

  // Determine if we should show the landing page
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isRealSanctuary = searchParams?.get('d') && (typeof window !== 'undefined' && window.location.hash);

  if (!isRealSanctuary || isPreviewing) {
    if (isPreviewing || !isRealSanctuary) {
        return (
          <main className="min-h-screen bg-sanctuary-bg text-center overflow-x-hidden flex flex-col">
            {/* Live Preview Overlay */}
            <AnimatePresence>
                {isPreviewing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-sanctuary-bg overflow-y-auto"
                    >
                        {/* Fixed Header */}
                        <div className="fixed top-4 left-4 right-4 p-2 bg-white/95 backdrop-blur-md border-2 border-sanctuary-primary rounded-2xl flex justify-between items-center z-[3000] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 text-gray-800">
                            <div className="flex items-center gap-2 pl-2">
                                <Sparkles className="text-sanctuary-primary" size={18} />
                                <span className="text-[10px] md:text-xs font-bold text-sanctuary-primary uppercase tracking-widest">Sanctuary Demo</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="hidden sm:flex items-center gap-2 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    localStorage.setItem('debug_unlock_all', 'true');
                                                } else {
                                                    localStorage.removeItem('debug_unlock_all');
                                                }
                                                setPreviewRefreshKey(prev => prev + 1);
                                            }}
                                        />
                                        <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-sanctuary-primary transition-all shadow-inner"></div>
                                        <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full peer-checked:left-5 transition-all shadow-md"></div>
                                    </div>
                                    <span className="text-[8px] font-bold text-sanctuary-soft uppercase tracking-widest group-hover:text-sanctuary-primary transition-colors text-gray-800">Unlock All</span>
                                </label>
                                <button 
                                    onClick={() => {
                                        setIsPreviewing(false);
                                        setPreviewConfig(null);
                                        localStorage.removeItem('debug_unlock_all');
                                    }}
                                    className="px-6 py-2 bg-sanctuary-primary text-white rounded-xl font-bold shadow-lg text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft size={14} /> Back to Homepage
                                </button>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <PreviewApp forceUpdateKey={previewRefreshKey} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
    
            {/* Hero Section */}
            <section className="flex-grow flex flex-col items-center justify-center p-8 relative">
              <div className="space-y-6 max-w-2xl relative z-10 text-gray-800">
                <Sparkles size={80} className="text-sanctuary-primary mx-auto animate-pulse" />
                <h1 className="text-6xl md:text-8xl font-bold text-sanctuary-primary font-sacramento text-center">Sanctuary Wizard</h1>
                <p className="text-xl md:text-2xl text-sanctuary-soft leading-relaxed text-center">
                  Build a digital sanctuary for your loved ones.
                </p>
                <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
                  <Link 
                    href="/wizard"
                    className="px-12 py-5 bg-sanctuary-primary text-white rounded-full text-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 justify-center"
                  >
                    <Zap size={24} className="fill-current" /> Create Your Story
                  </Link>
                  <button 
                    onClick={() => {
                        const DEMO_CONFIG: any = {
                            plan: 'infinite',
                            theme: 'lavender',
                            occasion: 'anniversary',
                            names: { sender: "Alex", recipient: "My Love" },
                            targetDate: new Date().toISOString(),
                            anniversaryDate: "2022-07-28T00:00:00",
                            totalDays: 3,
                            spotifyTracks: {
                              "day0": "4riDfclV7kPDT9D58FpmHd",
                              "day1": "0TZOdKFWNYfnwewAP8R4D8",
                              "day2": "657CttNzh41EseXiePl3qC",
                            },
                            notes: [
                              { id: "note1", day: 2, content: "Thinking of where we started..." },
                              { id: "note2", day: 1, content: "Can't wait for our big day!" },
                              { id: "note3", day: 0, content: "Happy Anniversary, my love! ❤️" },
                            ],
                            passcode: "1402",
                            videoUrl: "https://assets.mixkit.io/videos/preview/mixkit-heart-shaped-balloons-floating-in-the-sky-4288-large.mp4",
                            backgroundUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
                            galleryImages: {
                                "day0": ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"],
                                "day1": ["https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=800&q=80"],
                                "day2": ["https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80"]
                            }
                        };
                        setPreviewConfig(DEMO_CONFIG);
                        setIsPreviewing(true);
                    }}
                    className="px-12 py-5 border-2 border-sanctuary-primary text-sanctuary-primary rounded-full text-2xl font-bold hover:bg-sanctuary-primary/5 transition-all flex items-center gap-2 justify-center"
                  >
                    <ImageIcon size={24} /> Demo Preview
                  </button>
                </div>
              </div>
            </section>
    
            {/* Visual Preview / Features Section */}
            <section id="preview" className="py-24 px-8 bg-white/50 text-gray-800">
              <div className="max-w-5xl mx-auto space-y-24">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-sanctuary-primary font-sacramento">The Perfect Digital Gift</h2>
                  <p className="text-sanctuary-soft max-w-2xl mx-auto italic">More than just a link—it's a journey of your shared moments.</p>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 text-left">
                    <div className="w-12 h-12 bg-sanctuary-primary/10 rounded-2xl flex items-center justify-center text-sanctuary-primary">
                      <Heart size={24} className="fill-current" />
                    </div>
                    <h3 className="text-3xl font-bold text-sanctuary-primary font-sacramento text-4xl">1. The Interactive Reveal</h3>
                    <p className="text-sanctuary-soft leading-relaxed text-gray-800 text-left">
                      Your recipient begins with a themed interaction. 
                      They have to unlock your personalized message, leading to your custom surprise reveal.
                    </p>
                  </motion.div>
                  <div className="bg-sanctuary-bg rounded-3xl p-8 shadow-inner border-2 border-sanctuary-secondary/10 aspect-video flex items-center justify-center">
                     <Sparkles size={64} className="text-sanctuary-primary animate-bounce" />
                  </div>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
                  <div className="order-2 md:order-1 bg-sanctuary-bg rounded-3xl p-8 shadow-inner border-2 border-sanctuary-secondary/10 aspect-video flex items-center justify-center">
                    <div className="text-center space-y-4 w-full">
                        <div className="flex justify-center gap-2 text-left">
                            {[1, 2, 3].map(d => (
                                <div key={d} className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-sanctuary-primary font-bold border-2 border-sanctuary-secondary/20">
                                    {d}
                                </div>
                            ))}
                        </div>
                        <p className="font-bold text-sanctuary-soft uppercase tracking-widest text-xs">Timed Daily Unlocks</p>
                     </div>
                  </div>
                  <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 order-1 md:order-2 text-left">
                    <div className="w-12 h-12 bg-sanctuary-primary/10 rounded-2xl flex items-center justify-center text-sanctuary-primary">
                      <Music size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-sanctuary-primary font-sacramento text-4xl">2. The Countdown Journey</h3>
                    <p className="text-sanctuary-soft leading-relaxed">
                      Build anticipation. Add secret notes, songs, and photos that only unlock on the days leading up to your special event.
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>
    
            <section id="pricing" className="py-24 px-8 bg-white text-gray-800 text-left">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-sanctuary-primary mb-16 font-sacramento text-center">Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                  {/* Tiers similar to previous, renamed to Spark, Romance, Sanctuary */}
                  <div className="p-8 rounded-3xl border-2 border-sanctuary-secondary/20 flex flex-col text-left hover:border-sanctuary-secondary transition-all">
                    <h3 className="text-xl font-bold text-sanctuary-primary mb-2">The Spark</h3>
                    <div className="text-3xl font-bold text-sanctuary-primary mb-6">$2.00</div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-gray-800">
                      <li className="flex items-center gap-3 text-sanctuary-soft text-left"><Check className="text-green-500" size={16} /> 1 Day Sanctuary</li>
                      <li className="flex items-center gap-3 text-sanctuary-soft text-left"><Check className="text-green-500" size={16} /> 5 Secret Notes</li>
                      <li className="flex items-center gap-3 text-sanctuary-soft text-left"><Check className="text-green-500" size={16} /> 10 Photos</li>
                    </ul>
                    <Link href="/wizard?plan=spark" className="w-full py-3 text-center border-2 border-sanctuary-primary text-sanctuary-primary rounded-xl font-bold text-sm">Start Small</Link>
                  </div>
                  <div className="p-8 rounded-3xl border-2 border-sanctuary-primary relative flex flex-col text-left bg-white shadow-xl scale-105 z-10 border-t-8">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sanctuary-primary text-white px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest shadow-md">Popular</div>
                    <h3 className="text-xl font-bold text-sanctuary-primary mb-2 mt-2">The Romance</h3>
                    <div className="text-3xl font-bold text-sanctuary-primary mb-6">$7.00</div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-gray-800">
                      <li className="flex items-center gap-3 text-sanctuary-soft font-medium text-left"><Check className="text-green-500" size={16} /> 7 Day Journey</li>
                      <li className="flex items-center gap-3 text-sanctuary-soft font-medium text-left"><Check className="text-green-500" size={16} /> 25 Notes & 30 Photos</li>
                      <li className="flex items-center gap-3 text-sanctuary-soft font-medium text-left"><Check className="text-green-500" size={16} /> No Watermark</li>
                    </ul>
                    <Link href="/wizard?plan=plus" className="w-full py-4 text-center bg-sanctuary-primary text-white rounded-xl font-bold shadow-lg">Go Romance</Link>
                  </div>
                  <div className="p-8 rounded-3xl border-2 border-sanctuary-secondary/20 flex flex-col text-left hover:border-sanctuary-secondary transition-all text-gray-800">
                    <h3 className="text-xl font-bold text-sanctuary-primary mb-2">The Sanctuary</h3>
                    <div className="text-3xl font-bold text-sanctuary-primary mb-6">$12.00</div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-gray-800">
                      <li className="flex items-center gap-3 text-sanctuary-soft text-left"><Check className="text-green-500" size={16} /> 14 Day Experience</li>
                      <li className="flex items-center gap-3 text-sanctuary-soft text-left"><Check className="text-green-500" size={16} /> Unlimited Notes</li>
                      <li className="flex items-center gap-3 text-sanctuary-soft text-left"><Check className="text-green-500" size={16} /> Secret Cinema (Video)</li>
                    </ul>
                    <Link href="/wizard?plan=infinite" className="w-full py-3 text-center border-2 border-sanctuary-secondary text-sanctuary-secondary rounded-xl font-bold text-sm">Full Experience</Link>
                  </div>
                </div>
              </div>
            </section>
    
            <footer className="py-12 border-t bg-sanctuary-bg/50 text-gray-800">
              <div className="max-w-2xl mx-auto space-y-4 px-4 text-center text-gray-800">
                <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest font-bold text-sanctuary-soft">
                  <Link href="/privacy" className="hover:text-sanctuary-primary transition-colors text-gray-800">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-sanctuary-primary transition-colors text-gray-800">Terms of Service</Link>
                  <Link href="/revoke" className="hover:text-red-500 transition-colors text-gray-800">Revoke</Link>
                </div>
                <p className="text-sanctuary-soft text-[10px] uppercase tracking-tighter text-center text-gray-800">© 2026 Sanctuary Wizard • malthe@mbn-code.dk</p>
              </div>
            </footer>
          </main>
        );
    }
  }

  if (phase === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sanctuary-bg text-gray-800">
        <div className="w-8 h-8 border-4 border-sanctuary-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main>
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
    const [phase, setPhase] = useState<'invitation' | 'dashboard'>('invitation');
    return (
        <div className="min-h-screen text-gray-800" key={forceUpdateKey}>
            {phase === 'invitation' ? <Invitation onComplete={() => setPhase('dashboard')} /> : <Dashboard />}
        </div>
    );
}
