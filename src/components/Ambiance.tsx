"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSanctuary } from '@/utils/SanctuaryContext';
import { THEMES } from '@/utils/themes';
import { Heart, Star, Gift, Cake } from 'lucide-react';

const Ambiance = () => {
  const { config } = useSanctuary();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  const theme = THEMES[config?.theme || 'valentine'];
  const Icon = theme?.icon === 'heart' ? Heart : 
               theme?.icon === 'star' ? Star : 
               theme?.icon === 'cake' ? Cake : Gift;

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 5,
      duration: Math.random() * 20 + 20,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "110vh", x: `${p.x}vw`, opacity: 0 }}
          animate={{
            y: "-10vh",
            opacity: [0, 0.2, 0.2, 0],
            x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 20,
          }}
          className="absolute"
        >
          <Icon
            size={p.size}
            fill={theme.colors.primary}
            stroke={theme.colors.primary}
            style={{ opacity: 0.15 }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default Ambiance;
