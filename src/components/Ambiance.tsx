"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Ambiance = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

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
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill="#D63447"
            style={{ opacity: 0.15 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default Ambiance;
