"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft, ShieldAlert, Loader2 as LucideLoader, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { importKey, decryptData } from '@/utils/crypto';

export default function RevokePage() {
  const [url, setUrl] = useState('');
  const [status, setPhase] = useState<'idle' | 'verifying' | 'confirming' | 'deleting' | 'success' | 'error'>('idle');
  const [errorMsg, setError] = useState('');
  const [assetsFound, setAssets] = useState<string[]>([]);
  const [payload, setPayload] = useState<{ d: string, iv: string, k: string } | null>(null);

  const handleVerify = async () => {
    setPhase('verifying');
    setError('');
    
    try {
      const parsedUrl = new URL(url);
      const d = parsedUrl.searchParams.get('d');
      const iv = parsedUrl.searchParams.get('iv');
      const k = parsedUrl.hash.slice(1);

      if (!d || !iv || !k) {
        throw new Error("Invalid link. Make sure you've pasted the full sanctuary URL including the secret key after the '#'.");
      }

      const masterKey = await importKey(k);
      const config = await decryptData(d, iv, masterKey);
      
      const urls: string[] = [];
      if (config.backgroundUrl) urls.push(config.backgroundUrl);
      if (config.videoUrl) urls.push(config.videoUrl);
      if (config.galleryImages) {
        Object.values(config.galleryImages).forEach((dayImages: any) => {
          urls.push(...dayImages);
        });
      }

      if (urls.length === 0) {
        throw new Error("No uploaded media found for this link.");
      }

      setAssets(urls);
      setPayload({ d, iv, k });
      setPhase('confirming');
    } catch (e: any) {
      setPhase('error');
      setError(e.message || "Failed to parse link.");
    }
  };

  const executeDelete = async () => {
    if (!payload) return;
    setPhase('deleting');

    try {
      const res = await fetch('/api/delete-blobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          urls: assetsFound,
          ...payload
        })
      });

      const data = await res.json();
      if (data.success) {
        setPhase('success');
      } else {
        throw new Error(data.error || "Failed to delete assets.");
      }
    } catch (e: any) {
      setPhase('error');
      setError(e.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-sanctuary-secondary selection:text-sanctuary-primary">
      <div className="max-w-xl mx-auto px-6 py-20 space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[24px] flex items-center justify-center mx-auto shadow-sm">
            <Trash2 size={32} />
          </div>
          <h1 className="text-6xl font-serif-display tracking-tight text-slate-900 pt-4 leading-none text-center">Revoke Access</h1>
          <p className="text-slate-500 font-playfair italic text-xl text-center">Permanently wipe your digital footprint.</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-black/[0.03]">
          {status === 'idle' || status === 'verifying' || status === 'error' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Paste Sanctuary Link</label>
                <textarea 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://magicgift.vercel.app/?d=...#key"
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-sanctuary-primary outline-none transition-all text-xs font-mono h-32 resize-none bg-slate-50/50 text-slate-600"
                />
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 text-red-600 text-xs leading-relaxed">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={!url || status === 'verifying'}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'verifying' ? <LucideLoader className="animate-spin" size={20} /> : "Verify and Inspect Link"}
              </button>
            </div>
          ) : status === 'confirming' || status === 'deleting' ? (
            <div className="space-y-8">
              <div className="p-8 bg-red-50 rounded-[32px] border border-red-100 space-y-4 text-left">
                <div className="flex items-center gap-3 text-red-600">
                  <ShieldAlert size={24} />
                  <h3 className="font-bold uppercase tracking-widest text-[10px]">Destructive Action</h3>
                </div>
                <p className="text-sm text-red-700 leading-relaxed italic font-playfair">
                  We found <b>{assetsFound.length}</b> media assets associated with this sanctuary. 
                  Revoking will permanently delete these files and disable the shared link forever.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={executeDelete}
                  disabled={status === 'deleting'}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-bold shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  {status === 'deleting' ? <LucideLoader className="animate-spin" size={20} /> : "Destroy Sanctuary"}
                </button>
                <button
                  onClick={() => setPhase('idle')}
                  disabled={status === 'deleting'}
                  className="w-full py-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm text-center">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif-display text-slate-900 text-center">Assets Wiped</h2>
                <p className="text-slate-500 font-playfair italic text-lg leading-relaxed text-center">
                  All media has been permanently erased. The link is now inactive.
                </p>
              </div>
              <Link 
                href="/"
                className="inline-block px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all uppercase text-xs tracking-widest text-center"
              >
                Return to Homepage
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
