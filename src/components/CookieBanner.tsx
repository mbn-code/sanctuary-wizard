"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[1000]"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-valentine-pink/20 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-valentine-red">
              <Cookie size={24} />
              <h3 className="font-bold">Sweeten the experience?</h3>
            </div>
            <p className="text-xs text-valentine-soft leading-relaxed">
              We use essential cookies for payments and to remember your progress. No tracking, just love. By using the site, you agree to our 
              <Link href="/privacy" className="underline ml-1">Privacy Policy</Link>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="flex-grow bg-valentine-red text-white py-2 rounded-xl font-bold text-xs hover:scale-[1.02] transition-all"
              >
                Accept
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-4 py-2 border border-valentine-pink/20 rounded-xl text-valentine-soft text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
