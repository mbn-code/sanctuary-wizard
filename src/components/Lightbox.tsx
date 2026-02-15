"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import Image from 'next/image';

interface LightboxProps {
  images: { src: string; id: string }[];
  currentIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox = ({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) => {
  const [isScratched, setIsScratched] = useState(false);

  useEffect(() => {
    if (currentIndex !== null) {
      const currentImage = images[currentIndex];
      const storageKey = `scratch_${currentImage.id}`;
      setIsScratched(localStorage.getItem(storageKey) === 'true');
    }
  }, [currentIndex, images]);

  if (currentIndex === null) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12"
        onClick={onClose}
      >
        <button
          className="absolute top-6 right-6 text-white/70 hover:text-white z-[210] p-2"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X size={32} aria-hidden="true" />
        </button>

        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-[210] p-2 bg-white/10 rounded-full backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous image"
        >
          <ChevronLeft size={32} aria-hidden="true" />
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-[210] p-2 bg-white/10 rounded-full backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
        >
          <ChevronRight size={32} aria-hidden="true" />
        </button>

        <motion.div
          key={currentIndex}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isScratched ? (
            <div className="relative max-w-full h-[85vh] aspect-[3/4]">
              <Image
                src={currentImage.src}
                alt="Gallery view"
                fill
                className="object-contain rounded-lg shadow-2xl"
              />
            </div>
          ) : (
            <div className="w-[80vw] h-[60vh] bg-white/10 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-white/20 space-y-4">
              <Lock size={64} aria-hidden="true" className="text-white/20" />
              <div className="text-center">
                <p className="text-white/60 font-bold uppercase tracking-widest text-sm">Memory Hidden</p>
                <p className="text-white/60 text-xs mt-1">Scratch it in the gallery first!</p>
              </div>
            </div>
          )}
          <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Lightbox;
