"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink, Calendar, User, Layout, Clock } from 'lucide-react';
import Link from 'next/link';

interface SavedSanctuary {
  id: string;
  name: string;
  recipient: string;
  date: string;
  url: string;
  plan: string;
  createdAt: number;
}

export default function MySanctuaries() {
  const [sanctuaries, setSanctuaries] = useState<SavedSanctuary[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sanctuary_workspace');
    if (saved) {
      try {
        setSanctuaries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse workspace", e);
      }
    }
    setHasChecked(true);
  }, []);

  const removeSanctuary = (id: string) => {
    const updated = sanctuaries.filter(s => s.id !== id);
    setSanctuaries(updated);
    localStorage.setItem('sanctuary_workspace', JSON.stringify(updated));
  };

  if (!hasChecked || sanctuaries.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-slate-50/50">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif-display text-slate-900">Your Workspace</h2>
            <p className="text-sm text-slate-500 font-playfair italic text-left">Locally saved sanctuaries you've created.</p>
          </div>
          <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
            {sanctuaries.length} Sanctuary{sanctuaries.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {sanctuaries.sort((a, b) => b.createdAt - a.createdAt).map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-sanctuary-bg rounded-xl flex items-center justify-center text-sanctuary-primary">
                      <Layout size={20} />
                    </div>
                    <button 
                      onClick={() => removeSanctuary(s.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-serif-display text-slate-900">For {s.recipient}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      <Clock size={10} />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User size={12} className="text-sanctuary-primary" />
                      <span>To: <b>{s.recipient}</b></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} className="text-sanctuary-primary" />
                      <span>Event: <b>{new Date(s.date).toLocaleDateString()}</b></span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-black/[0.03] flex gap-2">
                  <a 
                    href={s.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-grow flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-slate-900/10"
                  >
                    Open <ExternalLink size={12} />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
