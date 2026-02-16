"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Music, Star, Gift, Cake } from 'lucide-react';
import { useSanctuary } from '@/utils/SanctuaryContext';
import { isTargetMet } from '@/utils/date';
import { THEMES } from '@/utils/themes';
import Link from 'next/link';

interface InvitationProps {
  onComplete: () => void;
}

const Invitation = ({ onComplete }: InvitationProps) => {
  const { config } = useSanctuary();
  const [taps, setTaps] = useState(0);
  const [phase, setPhase] = useState<'tapping' | 'question' | 'teaser'>('tapping');
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });

  const theme = THEMES[config?.theme || 'classic'];
  const Icon = theme?.icon === 'heart' ? Heart : 
               theme?.icon === 'star' ? Star : 
               theme?.icon === 'cake' ? Cake : Gift;

  const resetNoButton = () => {
    setNoButtonPos({ x: 0, y: 0 });
  };

  useEffect(() => {
    window.addEventListener('resize', resetNoButton);
    return () => window.removeEventListener('resize', resetNoButton);
  }, []);

  const handleTap = () => {
    const nextTaps = taps + 1;
    setTaps(nextTaps);

    if (nextTaps >= 10) {
      setPhase('question');
    }
  };

  const moveNoButton = () => {
    const btnWidth = 100;
    const btnHeight = 50;
    const padding = 20;
    const maxWidth = window.innerWidth - btnWidth - padding;
    const maxHeight = window.innerHeight - btnHeight - padding;
    const x = Math.random() * (maxWidth - padding) + padding - (window.innerWidth / 2 - btnWidth / 2);
    const y = Math.random() * (maxHeight - padding) + padding - (window.innerHeight / 2 - btnHeight / 2);
    setNoButtonPos({ x, y });
  };

  const handleYes = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [theme.colors.primary, theme.colors.secondary, theme.colors.accent]
    });

    setPhase('teaser');
    setTimeout(() => {
      onComplete();
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sanctuary-bg overflow-hidden relative text-sanctuary-text">
      {config?.backgroundUrl && (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ 
            backgroundImage: `url(${config.backgroundUrl})`,
            opacity: 0.15
          }}
        />
      )}
      <AnimatePresence mode="wait">
        {phase === 'tapping' && (
          <motion.div 
            key="tapping"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center"
          >
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-sanctuary-primary mb-8"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap the {theme.icon}
            </motion.h1>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleTap}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-sanctuary-secondary/30 rounded-full blur-xl group-hover:bg-sanctuary-secondary/50 transition duration-500" />
              <Icon 
                aria-hidden="true"
                className={`relative transition-colors duration-300 w-24 h-24 md:w-32 md:h-32 ${taps > 0 ? 'fill-sanctuary-primary text-sanctuary-primary' : 'text-sanctuary-secondary hover:text-sanctuary-primary'}`}
              />
              {taps > 0 && (
                <motion.span 
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -40 }}
                  key={taps}
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl font-bold text-sanctuary-primary"
                >
                  {taps}
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        )}

        {phase === 'question' && (
          <motion.div 
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-sanctuary-primary leading-tight font-serif-display text-gray-800">
              {config?.customQuestion || (config?.occasion === 'birthday' ? `Happy Birthday, ${config?.names.recipient}!` : `${config?.names.recipient}, will you be mine?`)}
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleYes}
                className="px-12 py-4 bg-sanctuary-primary text-white rounded-full text-2xl font-bold shadow-lg hover:brightness-110 transition-all"
              >
                Yes
              </motion.button>

              <motion.button
                animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                onMouseEnter={moveNoButton}
                tabIndex={-1}
                className="px-12 py-4 bg-sanctuary-secondary text-sanctuary-primary rounded-full text-2xl font-bold shadow-md cursor-default"
              >
                No
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'teaser' && (
          <motion.div 
            key="teaser"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h2 className="text-5xl font-bold text-sanctuary-primary">YEES! ✨</h2>
            <p className="text-xl text-sanctuary-soft">I knew you'd say yes, {config?.names.recipient}.</p>
            <div className="py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Icon size={60} aria-hidden="true" className="mx-auto text-sanctuary-secondary" />
              </motion.div>
            </div>
            <p className="text-lg font-medium text-sanctuary-primary animate-pulse">
              {isTargetMet() ? "Entering your sanctuary..." : "Your sanctuary is being prepared..."}
            </p>
            
            {config?.plan === 'spark' && (
              <div className="pt-12 space-y-2">
                <p className="text-[10px] text-sanctuary-soft uppercase tracking-[0.2em] font-bold">Powered by Magic Gift</p>
                <div className="flex justify-center gap-4 text-[8px] uppercase tracking-widest font-bold text-sanctuary-soft opacity-50">
                  <Link href="/privacy">Privacy</Link>
                  <Link href="/terms">Terms</Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Invitation;
