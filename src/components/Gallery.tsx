"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isDayUnlocked, getTimeUntilOffset } from '@/utils/date';
import { Clock } from 'lucide-react';
import ScratchOffImage from './ScratchOffImage';
import Lightbox from './Lightbox';
import { useSanctuary } from '@/utils/SanctuaryContext';
import { THEMES } from '@/utils/themes';

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

const Gallery = () => {
  const { config } = useSanctuary();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const theme = THEMES[config?.theme || 'valentine'];

  if (!config) return null;

  const getAllSections = () => {
      const sections = [];
      const totalDays = config.totalDays || 3;
      for (let i = 0; i < totalDays; i++) {
          const dayOffset = i;
          const images = config.galleryImages?.[`day${dayOffset}`] || [];
          sections.push({
              offset: dayOffset,
              images,
              label: dayOffset === 0 ? "The Grand Finale" : `Stage: ${dayOffset}`,
          });
      }
      return sections.sort((a, b) => b.offset - a.offset);
  };

  const allSections = getAllSections();

  const unlockedImages: { src: string; id: string }[] = allSections.flatMap((section) => 
    isDayUnlocked(section.offset) 
      ? section.images.map((src, idx) => ({ 
          src,
          id: `gallery_${section.offset}_${idx}`
        })) 
      : []
  );

  const handleImageClick = (id: string) => {
    const index = unlockedImages.findIndex(img => img.id === id);
    if (index !== -1) setLightboxIndex(index);
  };

  if (!allSections.some(s => s.images.length > 0)) {
      return null;
  }

  return (
    <div className="mt-12 space-y-12">
      <h2 className="text-4xl md:text-5xl font-bold text-sanctuary-primary text-center font-sacramento">Shared Memories</h2>
      
      {allSections.map((section) => {
        const unlocked = isDayUnlocked(section.offset);
        if (section.images.length === 0 && unlocked) return null;

        return (
          <div key={section.offset} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-grow bg-sanctuary-secondary/30" />
              <h3 className="text-sanctuary-soft text-sm font-bold uppercase tracking-widest">{section.label}</h3>
              <div className="h-[1px] flex-grow bg-sanctuary-secondary/30" />
            </div>

            {unlocked ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {section.images.map((src, index) => {
                  const id = `gallery_${section.offset}_${index}`;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="break-inside-avoid cursor-pointer"
                      onClick={() => handleImageClick(id)}
                    >
                      <ScratchOffImage
                        src={src}
                        alt={`Memory ${index + 1}`}
                        id={id}
                        borderRadius="12px"
                        chromeColor={theme.colors.secondary}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 bg-white/30 backdrop-blur-sm border-2 border-dashed border-sanctuary-secondary/30 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <Clock size={48} className="text-sanctuary-soft animate-pulse" />
                <div>
                  <p className="text-lg font-bold text-sanctuary-primary">Locked</p>
                  <LiveCountdown offset={section.offset} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Lightbox
        images={unlockedImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex(prev => prev !== null ? (prev - 1 + unlockedImages.length) % unlockedImages.length : null)}
        onNext={() => setLightboxIndex(prev => prev !== null ? (prev + 1) % unlockedImages.length : null)}
      />
    </div>
  );
};

export default Gallery;
