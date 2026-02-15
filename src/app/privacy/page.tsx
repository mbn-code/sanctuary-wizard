import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-valentine-cream p-8 md:p-24 text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-valentine-red font-bold hover:underline mb-8">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 text-valentine-red">
          <Shield size={40} />
          <h1 className="text-4xl font-bold font-sacramento">Privacy Policy</h1>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-valentine-soft">
          <p className="font-bold text-gray-700">Effective Date: February 14, 2026</p>
          
          <h2 className="text-xl font-bold text-valentine-red mt-6">1. Overview</h2>
          <p>
            Valentine Wizard ("we", "our", or "us") is committed to protecting your privacy. Unlike traditional services, we do not use a central database to store your sanctuary configurations. Your personal data stays in your unique URL.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">2. Data We Process</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Configuration Data:</strong> Names, dates, and notes are compressed and stored directly in the URL you share. We do not store these on our servers.</li>
            <li><strong>Media Assets:</strong> Photos and videos you upload are stored securely via <strong>Vercel Blob</strong>. These are publicly accessible via their unique URL to anyone who has your link. We do not index these files or make them searchable.</li>
            <li><strong>Payment Data:</strong> We use <strong>Stripe</strong> for payment processing. We never see or store your credit card details. Your transaction data is handled according to Stripe's Global Privacy Policy.</li>
          </ul>

          <h2 className="text-xl font-bold text-valentine-red mt-6">3. GDPR Compliance (EU Users)</h2>
          <p>
            As a service built in Denmark, we adhere to GDPR standards. We act as a "Data Controller" for the temporary handling of your assets during the upload process.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Right to Erasure:</strong> You can permanently delete your uploaded media at any time using the "Delete Sanctuary" button in the Wizard. This will trigger an immediate deletion from our storage provider.</li>
            <li><strong>Data Portability:</strong> All your data is contained within your shared URL.</li>
            <li><strong>Storage Duration:</strong> Assets are kept until you choose to delete them. We reserve the right to delete assets from inactive or broken links after reasonable periods to manage storage costs.</li>
          </ul>

          <h2 className="text-xl font-bold text-valentine-red mt-6">4. Cookies</h2>
          <p>
            We use minimal local storage to remember if you have accepted an invitation or to back up your configuration during the creation process. We do not use tracking or advertising cookies.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">5. Contact</h2>
          <p>
            If you have questions about your privacy, you can reach out to us at <span className="font-bold">malthe@mbn-code.dk</span> (or via our GitHub repository).
          </p>
        </section>
      </div>
    </main>
  );
}
