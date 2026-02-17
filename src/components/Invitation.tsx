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

  const getTeaserContent = () => {
    const name = config?.names.recipient;
    const occasion = config?.occasion || 'classic';

    switch (occasion) {
      case 'valentine':
      case 'wedding':
      case 'boyfriend':
      case 'girlfriend':
        return {
          title: "YEES!",
          message: `I knew you'd say yes, ${name}.`
        };
      case 'birthday':
        return {
          title: "Hooray!",
          message: `Let's celebrate your day, ${name}!`
        };
      case 'graduation':
        return {
          title: "Success!",
          message: `You've worked so hard for this, ${name}!`
        };
      case 'christmas':
        return {
          title: "Merry Christmas!",
          message: `Time for some festive magic, ${name}.`
        };
      case 'baby':
        return {
          title: "Welcome!",
          message: "A new adventure begins today."
        };
      case 'team':
        return {
          title: "Thank You!",
          message: `We're so glad to have you on the team, ${name}.`
        };
      default:
        return {
          title: "Hooray!",
          message: `Time to reveal your sanctuary, ${name}.`
        };
    }
  };

  const getButtonText = () => {
    const occasion = config?.occasion || 'classic';
    switch (occasion) {
      case 'valentine':
      case 'wedding':
      case 'boyfriend':
      case 'girlfriend':
        return "Yes";
      case 'birthday':
        return "Celebrate!";
      case 'graduation':
        return "See Surprise";
      case 'christmas':
        return "Open Advent";
      case 'baby':
      case 'party':
        return "Open Gift";
      case 'team':
        return "View Message";
      default:
        return "Enter";
    }
  };

  const teaser = getTeaserContent();

  const getQuestionText = () => {
    if (config?.customQuestion) return config.customQuestion;
    
    const name = config?.names.recipient;
    const occasion = config?.occasion || 'classic';

    switch (occasion) {
      case 'birthday':
        return `Happy Birthday, ${name}!`;
      case 'graduation':
        return `Congratulations on your Graduation, ${name}!`;
      case 'christmas':
        return `Merry Christmas, ${name}!`;
      case 'baby':
        return `A special welcome for a special someone.`;
      case 'team':
        return `A token of our appreciation for you, ${name}.`;
      case 'valentine':
        return `${name}, will you be my Valentine?`;
      case 'wedding':
        return `${name}, to our forever?`;
      case 'boyfriend':
      case 'girlfriend':
        return `Happy National ${occasion === 'boyfriend' ? 'Boyfriend' : 'Girlfriend'} Day, ${name}!`;
      case 'anniversary':
        return `Happy Anniversary, ${name}!`;
      default:
        return `${name}, I have a surprise for you.`;
    }
  };

  const isAskOccasion = () => {
    const occasion = config?.occasion || 'classic';
    return ['valentine', 'wedding', 'boyfriend', 'girlfriend'].includes(occasion) || !!config?.customQuestion;
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
      
      <AnimatePresence>
        {phase === 'teaser' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <video 
              src="/videos/hero-sanctuary.mp4"
              poster="/videos/hero-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
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
              className="text-3xl md:text-4xl font-bold text-sanctuary-primary mb-8 font-s-display"
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
            <h2 className="text-4xl md:text-5xl font-bold text-sanctuary-primary leading-tight font-s-display text-gray-800">
              {getQuestionText()}
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleYes}
                className="px-12 py-4 bg-sanctuary-primary text-white rounded-full text-2xl font-bold shadow-lg hover:brightness-110 transition-all"
              >
                {getButtonText()}
              </motion.button>

              {isAskOccasion() && (
                <motion.button
                  animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                  onMouseEnter={moveNoButton}
                  tabIndex={-1}
                  className="px-12 py-4 bg-sanctuary-secondary text-sanctuary-primary rounded-full text-2xl font-bold shadow-md cursor-default"
                >
                  No
                </motion.button>
              )}
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
            <h2 className="text-5xl font-bold text-sanctuary-primary font-s-display">{teaser.title}</h2>
            <p className="text-xl text-sanctuary-soft">{teaser.message}</p>
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
            
            {(config?.plan === 'spark' || config?.plan === 'viral') && (
              <div className="pt-12 space-y-2">
                <p className="text-[10px] text-sanctuary-soft uppercase tracking-[0.2em] font-bold">
                  Powered by <span className="text-sanctuary-primary">Sanctuary</span>
                </p>
                <div className="flex justify-center gap-4 text-[8px] uppercase tracking-widest font-bold text-sanctuary-soft opacity-50">
                  <Link href="/">Build Yours</Link>
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
