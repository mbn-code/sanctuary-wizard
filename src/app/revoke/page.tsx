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
        throw new Error("Invalid link. Include the part after '#'.");
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
    <main className="min-h-screen bg-sanctuary-bg p-4 md:p-8 flex flex-col items-center justify-center text-gray-800">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 space-y-8">
        <Link href="/" className="flex items-center gap-2 text-sanctuary-primary font-bold hover:underline mb-4 text-sm">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={32} />
          </div>
          <h1 className="text-3xl font-bold text-sanctuary-primary font-sacramento text-5xl">Revoke Sanctuary</h1>
          <p className="text-sanctuary-soft text-sm italic">Permanently delete all uploaded assets and disable a shared link.</p>
        </div>

        {status === 'idle' || status === 'verifying' || status === 'error' ? (
          <div className="space-y-6 text-left">
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-sanctuary-soft uppercase tracking-widest text-left">Paste Sanctuary Link</label>
              <textarea 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://magicgift.vercel.app/?d=...#key"
                className="w-full p-4 rounded-xl border-2 border-sanctuary-secondary/20 focus:border-sanctuary-primary outline-none transition-all text-xs font-mono h-32 resize-none bg-white text-gray-800"
              />
            </div>

            {status === 'error' && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 text-red-600 text-xs leading-relaxed text-left">
                <AlertCircle size={16} className="shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={!url || status === 'verifying'}
              className="w-full py-4 bg-sanctuary-primary text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'verifying' ? <LucideLoader className="animate-spin" size={20} /> : "Verify Link"}
            </button>
          </div>
        ) : status === 'confirming' || status === 'deleting' ? (
          <div className="space-y-6 text-gray-800 text-left">
            <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 space-y-4 text-left">
              <div className="flex items-center gap-3 text-red-600">
                <ShieldAlert size={24} />
                <h3 className="font-bold uppercase tracking-wider text-xs">Irreversible Action</h3>
              </div>
              <p className="text-xs text-red-700 leading-relaxed text-left">
                We found <b>{assetsFound.length}</b> assets (photos/videos) linked to this sanctuary. 
                Deleting them will permanently break the shared link. 
                <br /><br />
                <b>This action cannot be undone.</b>
              </p>
            </div>

            <button
              onClick={executeDelete}
              disabled={status === 'deleting'}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              {status === 'deleting' ? <LucideLoader className="animate-spin" size={20} /> : "Yes, Delete Everything Permanently"}
            </button>
            <button
              onClick={() => setPhase('idle')}
              disabled={status === 'deleting'}
              className="w-full py-2 text-sanctuary-soft text-xs font-bold uppercase tracking-widest hover:text-sanctuary-primary transition-colors text-left"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-left">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Assets Wiped</h2>
              <p className="text-sanctuary-soft text-sm italic leading-relaxed text-center">
                All media has been permanently removed. The link is now inactive.
              </p>
            </div>
            <Link 
              href="/"
              className="inline-block px-8 py-3 bg-sanctuary-primary text-white rounded-full font-bold shadow-md hover:brightness-110 transition-all"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </main>
  );

}
