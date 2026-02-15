"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ScratchOffImageProps {
  src: string;
  alt: string;
  id: string;
  borderRadius: string;
  chromeColor: string;
  filter?: string;
}

const ScratchOffImage = ({ src, alt, id, borderRadius, chromeColor, filter }: ScratchOffImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const storageKey = `scratch_${id}`;

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'true') {
      setIsScratched(true);
    }
    setIsInitialized(true);
  }, [storageKey]);

  useEffect(() => {
    if (isScratched || !isInitialized || !imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const initCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#D1D5DB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#9CA3AF';
      for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'destination-out';
    };

    initCanvas();
    
    // Resize observer is better than window resize event for specific elements
    const observer = new ResizeObserver(() => {
      if (!isScratched) initCanvas();
    });
    observer.observe(canvas.parentElement!);

    let isDrawing = false;

    const scratch = (x: number, y: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    };

    const checkScratchPercentage = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
      }

      const percentage = (transparentPixels / (pixels.length / 4)) * 100;
      if (percentage > 45) {
        setIsScratched(true);
        localStorage.setItem(storageKey, 'true');
      }
    };

    const handleMouseDown = (e: MouseEvent) => { 
      isDrawing = true; 
      const rect = canvas.getBoundingClientRect();
      scratch(e.clientX - rect.left, e.clientY - rect.top);
    };
    const handleMouseUp = () => { 
      if (isDrawing) {
        isDrawing = false;
        checkScratchPercentage();
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      scratch(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleTouchStart = (e: TouchEvent) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      scratch(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      scratch(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleMouseUp);

    return () => {
      observer.disconnect();
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  }, [isScratched, isInitialized, imageLoaded, storageKey]);

  return (
    <div className="relative w-full overflow-hidden" style={{ borderRadius }}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={800}
        className="w-full h-auto block border-4"
        style={{ borderRadius, borderColor: chromeColor, filter }}
        onLoad={() => setImageLoaded(true)}
      />
      
      <AnimatePresence>
        {!isScratched && (
          <motion.canvas
            ref={canvasRef}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none overflow-hidden"
            style={{ borderRadius, border: `4px solid ${chromeColor}`, touchAction: 'none' }}
          />
        )}
      </AnimatePresence>

      {!isScratched && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-valentine-red uppercase tracking-widest shadow-sm">
            Scratch to reveal
          </p>
        </div>
      )}
    </div>
  );
};

export default ScratchOffImage;
