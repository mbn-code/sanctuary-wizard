import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-sanctuary-secondary selection:text-sanctuary-primary">
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="space-y-4 text-left">
          <div className="w-16 h-16 bg-sanctuary-primary/10 rounded-[24px] flex items-center justify-center text-sanctuary-primary">
            <Scale size={32} />
          </div>
          <h1 className="text-6xl font-serif-display tracking-tight text-slate-900 leading-none pt-4">Terms of Service</h1>
          <p className="text-slate-500 font-playfair italic text-xl">The foundation of our agreement.</p>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-black/[0.03] prose prose-slate max-w-none text-left">
          <section className="space-y-8 text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-900 text-sm uppercase tracking-widest border-b border-black/[0.03] pb-4 text-left">Effective Date: February 14, 2026</p>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-serif-display text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By using Sanctuary ("the Service"), you agree to these terms. You must be at least 18 years of age to use this service. If you do not agree or do not meet the age requirement, please do not use the service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif-display text-slate-900">2. Description of Service</h2>
              <p>
                Sanctuary provides a digital tool to create personalized, interactive web pages. Paid tiers unlock additional customization features.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif-display text-slate-900">3. Payments and Refunds</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Final Sale:</strong> Due to the nature of digital goods and immediate asset processing costs, all purchases are final. We do not offer refunds once a premium link has been generated.</li>
                <li><strong>Technical Issues:</strong> We are not responsible for malfunctions caused by user error. Refunds will not be issued even in cases of technical difficulty, as the service is provided "as-is".</li>
                <li><strong>One-time Payment:</strong> Payments are one-time fees, not recurring subscriptions.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif-display text-slate-900">4. User Conduct</h2>
              <p>
                You are solely responsible for the content you upload. You agree not to upload any content that is illegal, harmful, threatening, contains nudity, or infringes on the intellectual property rights of others.
              </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-black/[0.03]">
              <h2 className="text-2xl font-serif-display text-slate-900">Contact</h2>
              <p>
                For support or legal inquiries, reach out to <a href="mailto:malthe@mbn-code.dk" className="text-sanctuary-primary font-bold hover:underline">malthe@mbn-code.dk</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
