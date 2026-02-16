"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Music, Sparkles, ImageIcon, Play } from 'lucide-react';

const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-tr from-sanctuary-secondary/40 via-sanctuary-primary/10 to-amber-100/30 blur-[80px] rounded-full"
        />
      </div>

      {/* Main Phone Mockup */}
      <motion.div
        initial={{ y: 40, opacity: 0, rotate: -5 }}
        animate={{ y: 0, opacity: 1, rotate: -2 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="relative z-20 w-[240px] h-[480px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden group"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-30" />
        
        {/* Screen Content */}
        <div className="absolute inset-0 bg-[#FDFCFB] overflow-hidden flex flex-col">
            <div className="flex-grow relative">
                <video 
                    src="/videos/hero-sanctuary.mp4" 
                    poster="/videos/hero-poster.jpg"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                
                {/* Floating UI Elements inside phone */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                    <div className="h-1 w-12 bg-white/40 rounded-full" />
                    <div className="h-3 w-32 bg-white/60 rounded-full" />
                    <div className="h-2 w-24 bg-white/30 rounded-full" />
                </div>
            </div>
        </div>
      </motion.div>

      {/* Floating Card 1: Scratch-off Preview */}
      <motion.div
        initial={{ x: 60, y: 100, opacity: 0, rotate: 12 }}
        animate={{ x: 120, y: 80, opacity: 1, rotate: 8 }}
        whileHover={{ y: 70, scale: 1.05, rotate: 10 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="absolute z-30 right-0 bottom-1/4 w-40 aspect-[3/4] glass rounded-2xl shadow-2xl p-2 border border-white/60 hidden md:block"
      >
        <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-sanctuary-secondary/30 flex flex-col items-center justify-center gap-2">
                <ImageIcon size={24} className="text-sanctuary-primary/40" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-sanctuary-primary/60">Scratch Me</span>
            </div>
            {/* Fake scratch reveal effect */}
            <motion.div 
                animate={{ x: "100%" }}
                transition={{ duration: 2, delay: 3, repeat: Infinity, repeatDelay: 4 }}
                className="absolute inset-0 bg-slate-200 shadow-xl z-10"
            />
        </div>
      </motion.div>

      {/* Floating Card 2: Music Widget */}
      <motion.div
        initial={{ x: -60, y: -100, opacity: 0, rotate: -12 }}
        animate={{ x: -130, y: -120, opacity: 1, rotate: -6 }}
        whileHover={{ y: -130, scale: 1.05, rotate: -4 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="absolute z-30 left-0 top-1/4 w-48 glass rounded-2xl shadow-2xl p-4 border border-white/60 flex items-center gap-3 hidden md:flex"
      >
        <div className="w-10 h-10 bg-sanctuary-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-sanctuary-primary/20">
            <Play size={16} fill="white" />
        </div>
        <div className="space-y-1">
            <div className="h-2 w-20 bg-slate-800/80 rounded-full" />
            <div className="h-1.5 w-12 bg-slate-400/40 rounded-full" />
        </div>
        <div className="ml-auto">
            <Music size={14} className="text-sanctuary-primary animate-pulse" />
        </div>
      </motion.div>

      {/* Floating Elements: Hearts & Sparkles */}
      <motion.div
        animate={{ 
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-20 text-sanctuary-primary"
      >
        <Heart size={24} fill="currentColor" />
      </motion.div>

      <motion.div
        animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 left-20 text-amber-400"
      >
        <Sparkles size={32} />
      </motion.div>
    </div>
  );
};

export default HeroVisual;
