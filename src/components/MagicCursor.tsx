"use client";

import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useSanctuary } from '@/utils/SanctuaryContext';
import { THEMES } from '@/utils/themes';
import { Heart, Star, Gift, Cake } from 'lucide-react';

const MagicCursor = () => {
  const { config } = useSanctuary();
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const theme = THEMES[config?.theme || 'valentine'];
  const Icon = theme?.icon === 'heart' ? Heart : 
               theme?.icon === 'star' ? Star : 
               theme?.icon === 'cake' ? Cake : Gift;

  const springConfig = { damping: 20, stiffness: 300 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 10);
      cursorY.set(e.clientY - 10);
      
      const target = e.target as HTMLElement;
      if (target) {
        const computedStyle = window.getComputedStyle(target);
        setIsPointer(computedStyle.cursor === 'pointer');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        translateX: cursorX,
        translateY: cursorY,
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
      animate={{
        scale: isPointer ? 1.5 : 1,
      }}
    >
      <Icon 
        size={20} 
        fill={theme.colors.primary} 
        stroke={theme.colors.primary}
        style={{ opacity: 0.8 }}
      />
    </motion.div>
  );
};

export default MagicCursor;
