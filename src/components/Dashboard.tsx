"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeTogether, isDayUnlocked, getTimeUntilOffset } from '@/utils/date';
import { Heart, Music, Clock, Lock, Sparkles, Key, Shield, Trash2, ArrowLeft } from 'lucide-react';
import Gallery from './Gallery';
import SecretCinema from './SecretCinema';
import Ambiance from './Ambiance';
import Link from 'next/link';
import { useSanctuary } from '@/utils/SanctuaryContext';
import DOMPurify from 'isomorphic-dompurify';
import Image from 'next/image';

const LiveCountdown = ({ offset }: { offset: number }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilOffset(offset));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilOffset(offset));
    }, 1000);
    return () => clearInterval(timer);
  }, [offset]);

  return (
    <div className="flex gap-1 text-[10px] font-mono font-bold text-sanctuary-soft">
      <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
      <span>:</span>
      <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
      <span>:</span>
      <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
    </div>
  );
};

const UnlockableNote = ({ id, dayOffset, content }: { id: string, dayOffset: number, content: string }) => {
  const [unlocked, setUnlocked] = React.useState(false);
  const isAvailable = isDayUnlocked(dayOffset);
  const storageKey = `user_unlocked_${id}`;

  React.useEffect(() => {
    const userUnlocked = localStorage.getItem(storageKey) === 'true';
    setUnlocked(userUnlocked || isAvailable); // Auto unlock if date is passed
  }, [id, isAvailable, storageKey]);

  const handleUnlock = () => {
    localStorage.setItem(storageKey, 'true');
    setUnlocked(true);
  };

  if (!isAvailable) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2 text-sanctuary-soft relative">
        <Clock size={24} />
        <div className="group relative text-center">
          <LiveCountdown offset={dayOffset} />
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2 text-sanctuary-soft">
        <button 
          className="bg-sanctuary-primary text-white px-4 py-2 rounded-full shadow font-bold hover:brightness-110 transition-all focus:outline-none text-xs"
          onClick={handleUnlock}
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div 
      className="italic text-base text-sanctuary-primary p-2 leading-relaxed h-full flex items-center justify-center text-center break-words"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  );
};

const Dashboard = () => {
  const { config, isLocked, decryptWithPasscode } = useSanctuary();
  const [time, setTime] = useState(getTimeTogether());
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPremiumVerified, setIsPremiumVerified] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeTogether());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (config?.signature) {
        const verify = async () => {
            try {
                const partnerNames = `${config.names.sender}:${config.names.recipient}`;
                const res = await fetch('/api/verify-premium', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        plan: config.plan, 
                        partnerNames, 
                        signature: config.signature 
                    })
                });
                const data = await res.json();
                setIsPremiumVerified(data.success);
            } catch (e) {
                console.error("Premium verification failed", e);
            }
        };
        verify();
    }
  }, [config]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPasscode = [...passcode];
    newPasscode[index] = value.slice(-1);
    setPasscode(newPasscode);
    setError(false);
    if (value && index < 3) {
      document.getElementById(`lock-digit-${index + 1}`)?.focus();
    }
  };

  const handleUnlock = async () => {
    setIsVerifying(true);
    const success = await decryptWithPasscode(passcode.join(''));
    if (!success) {
      setError(true);
      setPasscode(['', '', '', '']);
      document.getElementById('lock-digit-0')?.focus();
    }
    setIsVerifying(false);
  };

  useEffect(() => {
    if (passcode.every(digit => digit !== '')) {
      handleUnlock();
    }
  }, [passcode]);

  if (!config) return null;

  if (isLocked) {
    return (
      <main className="min-h-screen bg-sanctuary-bg flex flex-col items-center justify-center p-8 text-center text-sanctuary-text">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl space-y-8 border-2 border-sanctuary-secondary/20">
          <div className="w-20 h-20 bg-sanctuary-primary/10 rounded-full flex items-center justify-center mx-auto text-sanctuary-primary">
            <Lock size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-sanctuary-primary font-sacramento text-5xl">Locked Sanctuary</h2>
            <p className="text-sanctuary-soft mt-2 italic text-sm text-gray-800">Enter the passcode to unlock the memories.</p>
          </div>
          
          <div className="flex justify-center gap-3">
            {passcode.map((digit, idx) => (
              <input
                key={idx}
                id={`lock-digit-${idx}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInput(idx, e.target.value)}
                className={`w-12 h-16 text-center text-3xl font-bold rounded-xl border-2 transition-all outline-none text-gray-800 ${error ? 'border-red-500 bg-red-50' : 'border-sanctuary-secondary/30 focus:border-sanctuary-primary bg-white shadow-inner'}`}
                autoComplete="off"
              />
            ))}
          </div>
          {isVerifying && <div className="animate-spin text-sanctuary-primary inline-block mx-auto"><Sparkles size={24} /></div>}
          {error && <p className="text-red-500 text-xs font-bold animate-shake">Incorrect code. Try again.</p>}
        </motion.div>
      </main>
    );
  }

  const spotifyItems = Object.entries(config.spotifyTracks)
    .map(([key, id]) => ({
        dayOffset: parseInt(key.replace('day', '')),
        id,
        title: `Stage: ${key.replace('day', '')}`
    }))
    .sort((a, b) => b.dayOffset - a.dayOffset);

  return (
    <div className="min-h-screen bg-sanctuary-bg p-4 md:p-8 relative pb-32 text-sanctuary-text">
      {config.backgroundUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.15]">
          <Image
            src={config.backgroundUrl}
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      <Ambiance />
      
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <header className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-sanctuary-primary select-none font-sacramento flex items-center justify-center gap-3"
          >
            Our Sanctuary
            {isPremiumVerified && (
                <div className="group relative">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 shadow-sm animate-in zoom-in duration-700">
                        <Shield size={16} className="text-amber-600 fill-amber-600/20" />
                    </div>
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-32 p-2 bg-slate-900 text-white text-[8px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-sans uppercase tracking-[0.2em] font-bold text-center border border-white/10">
                        Authentic Premium
                    </span>
                </div>
            )}
          </motion.h1>
          <p 
            className="text-sanctuary-soft font-medium text-sm md:text-base italic"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`For ${config.names.recipient}, from ${config.names.sender}`) }}
          />
        </header>

        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 bg-white/50 backdrop-blur-sm border-2 border-sanctuary-secondary/20 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sanctuary-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-left">
                  <Clock size={14} />
                  Our Time
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center items-center">
                  {Object.entries(time).map(([unit, value]) => (
                    <div key={unit} className="flex flex-col">
                      <span className="text-2xl md:text-3xl font-bold text-sanctuary-primary">{value}</span>
                      <span className="text-[10px] uppercase tracking-wider text-sanctuary-soft">{unit}</span>
                    </div>
                  ))}
                </div>
             </motion.div>

             {spotifyItems.map((item, idx) => {
                const safeId = item.id?.replace(/[^a-zA-Z0-9]/g, '');
                return (
                  <motion.div
                    key={item.dayOffset}
                    whileHover={{ scale: 1.02 }}
                    className={`${idx === 0 && spotifyItems.length % 2 !== 0 ? 'md:col-span-2' : 'col-span-1'} bg-white/50 backdrop-blur-sm border-2 border-sanctuary-secondary/20 rounded-3xl p-6 shadow-sm flex flex-col`}
                  >
                    <h3 className="text-sanctuary-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-left">
                      <Music size={14} />
                      {item.title}
                    </h3>
                    <div className="flex-grow">
                      {isDayUnlocked(item.dayOffset) && safeId ? (
                        <div className="w-full h-full min-h-[152px]">
                          <iframe 
                            style={{ borderRadius: '12px' }} 
                            src={`https://open.spotify.com/embed/track/${safeId}?utm_source=generator`} 
                            width="100%" height="152" frameBorder="0" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                          ></iframe>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-2 text-sanctuary-soft">
                            <Clock size={40} />
                            <p className="text-sm font-medium">Unlocks in</p>
                            <LiveCountdown offset={item.dayOffset} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
             })}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-grow bg-sanctuary-secondary/30" />
            <h2 className="text-3xl font-bold text-sanctuary-primary font-sacramento text-5xl px-4">Notes</h2>
            <div className="h-[1px] flex-grow bg-sanctuary-secondary/30" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.notes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 backdrop-blur-sm border-2 border-sanctuary-secondary/20 rounded-3xl p-6 shadow-sm flex flex-col min-h-[120px]"
              >
                <h3 className="text-sanctuary-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-left">
                  <Heart size={14} className="text-sanctuary-primary" />
                  Message
                </h3>
                <div className="flex-grow">
                  <UnlockableNote 
                    id={note.id} 
                    dayOffset={note.day} 
                    content={note.content}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {config.plan !== 'spark' ? (
            <Gallery />
        ) : (
            <div className="mt-20 p-8 text-center bg-white/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-sanctuary-secondary/30">
                <Lock size={40} className="mx-auto text-sanctuary-soft mb-4" />
                <h3 className="text-xl font-bold text-sanctuary-primary mb-2">Unlock the Full Gallery?</h3>
                <p className="text-sm text-sanctuary-soft mb-6">Upgrade to <b>The Romance</b> plan to share unlimited memories!</p>
                <Link href="/wizard" className="px-8 py-3 bg-sanctuary-primary text-white rounded-full font-bold shadow-lg inline-block text-sm">View Plans</Link>
            </div>
        )}

        <SecretCinema />

        <div className="pt-20 pb-10 text-center opacity-30 hover:opacity-100 transition-opacity">
            <Link href="/revoke" className="text-[10px] uppercase tracking-widest font-bold text-sanctuary-soft hover:text-red-500">
                Revoke Sanctuary Access
            </Link>
        </div>
      </div>

      {config.plan === 'spark' && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-sanctuary-secondary/20 text-center z-50">
            <p className="text-[10px] uppercase tracking-[0.2em] text-sanctuary-soft font-bold flex items-center justify-center gap-2">
                Created with <span className="text-sanctuary-primary">Sanctuary</span>
                <Link href="/wizard" className="underline hover:text-sanctuary-primary ml-2 text-gray-800">Upgrade yours →</Link>
            </p>
            <div className="flex justify-center gap-4 text-[8px] uppercase tracking-widest font-bold text-sanctuary-soft mt-1 opacity-50">
              <Link href="/privacy" className="hover:text-sanctuary-primary text-gray-800">Privacy</Link>
              <Link href="/terms" className="hover:text-sanctuary-primary text-gray-800">Terms</Link>
              <Link href="/revoke" className="hover:text-red-500 text-gray-800">Revoke</Link>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
