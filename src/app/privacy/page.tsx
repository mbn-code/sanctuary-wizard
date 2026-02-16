import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-sanctuary-secondary selection:text-sanctuary-primary">
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-sanctuary-primary/10 rounded-[24px] flex items-center justify-center text-sanctuary-primary">
            <Shield size={32} />
          </div>
          <h1 className="text-6xl font-serif-display tracking-tight text-slate-900 leading-none pt-4">Privacy Policy</h1>
          <p className="text-slate-500 font-playfair italic text-xl">Transparency and security by design.</p>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-black/[0.03] prose prose-slate max-w-none">
          <section className="space-y-8 text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-900 text-sm uppercase tracking-widest border-b border-black/[0.03] pb-4">Effective Date: February 14, 2026</p>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-serif-display text-slate-900">1. Overview</h2>
              <p>
                Sanctuary ("we", "our", or "us") is committed to protecting your privacy. Unlike traditional services, we do not use a central database to store your sanctuary configurations. Your personal data stays in your unique URL.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif-display text-slate-900">2. Data We Process</h2>
              <ul className="space-y-4 list-none pl-0">
                <li className="bg-slate-50 p-6 rounded-2xl border border-black/[0.03]">
                  <strong className="text-slate-900 block mb-1">Configuration Data:</strong>
                  Names, dates, and notes are compressed and stored directly in the URL you share. We do not store these on our servers.
                </li>
                <li className="bg-slate-50 p-6 rounded-2xl border border-black/[0.03]">
                  <strong className="text-slate-900 block mb-1">Media Assets:</strong>
                  Photos and videos you upload are stored securely via <strong>Vercel Blob</strong>. These are publicly accessible via their unique URL to anyone who has your link. We do not index these files or make them searchable.
                </li>
                <li className="bg-slate-50 p-6 rounded-2xl border border-black/[0.03]">
                  <strong className="text-slate-900 block mb-1">Payment Data:</strong>
                  We use <strong>Stripe</strong> for payment processing. We never see or store your credit card details. Your transaction data is handled according to Stripe's Global Privacy Policy.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif-display text-slate-900">3. GDPR Compliance</h2>
              <p>
                As a service built in Denmark, we adhere to GDPR standards. We act as a "Data Controller" for the temporary handling of your assets during the upload process.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Right to Erasure:</strong> You can permanently delete your uploaded media at any time using the "Revoke" page. This will trigger an immediate deletion from our storage provider.</li>
                <li><strong>Data Portability:</strong> All your data is contained within your shared URL.</li>
                <li><strong>Storage Duration:</strong> Assets are kept until you choose to delete them. We reserve the right to delete assets from inactive or broken links after reasonable periods to manage storage costs.</li>
              </ul>
            </div>

            <div className="space-y-4 pt-8 border-t border-black/[0.03]">
              <h2 className="text-2xl font-serif-display text-slate-900">Contact</h2>
              <p>
                If you have questions about your privacy, you can reach out to us at <a href="mailto:malthe@mbn-code.dk" className="text-sanctuary-primary font-bold hover:underline">malthe@mbn-code.dk</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
