"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, Film, X, Music } from 'lucide-react';
import { useSanctuary } from '@/utils/SanctuaryContext';

const DEFAULT_VIDEO = "https://assets.mixkit.io/videos/preview/mixkit-heart-shaped-balloons-floating-in-the-sky-4288-large.mp4";

const SecretCinema = () => {
  const { config, isLocked } = useSanctuary();
  const [showCinema, setShowCinema] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('');

  useEffect(() => {
    if (config) {
        const dayKeys = Object.keys(config.spotifyTracks).sort();
        if (dayKeys.length > 0) {
            setSelectedTrack(config.spotifyTracks[dayKeys[0]]);
        }
    }
  }, [config]);

  if (!config) return null;
  if (isLocked) return null;

  const getTracks = () => {
      return Object.entries(config.spotifyTracks)
        .map(([key, id]) => ({
            id,
            title: `Stage ${key.replace('day', '')}`
        }))
        .filter(t => !!t.id);
  };

  const tracks = getTracks();

  if (showCinema) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[500] bg-black flex flex-col md:flex-row overflow-hidden"
      >
        <div className="w-full md:w-[400px] h-1/3 md:h-full bg-zinc-950/20 backdrop-blur-3xl border-r border-white/5 flex flex-col p-6 md:p-12 shrink-0 overflow-y-auto custom-scrollbar z-10 text-white/80 text-left">
          <div className="flex items-center gap-3 text-sanctuary-primary mb-8 px-2 shrink-0">
            <Music size={28} className="animate-pulse" />
            <h3 className="font-bold text-xs tracking-widest uppercase opacity-60">Soundtrack</h3>
          </div>
          
          <div className="space-y-6">
            {tracks.map((track) => {
              const safeId = track.id?.replace(/[^a-zA-Z0-9]/g, '');
              return (
                <div 
                  key={track.id} 
                  className={`relative transition-all duration-700 cursor-pointer ${selectedTrack === track.id ? 'scale-105 opacity-100' : 'opacity-40 hover:opacity-60'}`}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  {safeId && (
                    <iframe
                      style={{ borderRadius: '12px' }}
                      src={`https://open.spotify.com/embed/track/${safeId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-4 relative bg-black">
          <button 
            onClick={() => setShowCinema(false)}
            className="absolute top-8 right-8 text-white/20 hover:text-white transition-all z-50 p-3"
          >
            <X size={32} />
          </button>

          <div className="h-[70vh] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-zinc-800 relative">
            <video 
              src={(config.plan === 'infinite' && config.videoUrl) ? config.videoUrl : DEFAULT_VIDEO} 
              controls 
              autoPlay 
              muted
              loop
              className="w-full h-full object-cover"
            />
          </div>
          
          <h2 className="mt-8 text-4xl font-bold text-sanctuary-primary font-sacramento text-center">
            {config.plan === 'infinite' ? 'Our Moments' : 'A Special Delivery'}
          </h2>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="mt-20 mb-12 py-12 px-6 rounded-3xl bg-white/30 backdrop-blur-md border-2 border-sanctuary-secondary/20 text-center relative overflow-hidden">
        <div className="max-w-md mx-auto space-y-6 text-gray-800">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-sanctuary-primary text-white shadow-xl">
            <Film size={40} />
          </div>
          <h2 className="text-3xl font-bold text-sanctuary-primary font-sacramento text-5xl mb-2">Secret Cinema</h2>
          <p className="text-sanctuary-soft text-sm italic">Memories unlocked and decrypted.</p>
          <button 
            onClick={() => setShowCinema(true)}
            className="px-10 py-4 bg-sanctuary-primary text-white rounded-full text-xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            <Play size={24} className="fill-current" />
            Start Movie
          </button>
        </div>
    </section>
  );
};

export default SecretCinema;
