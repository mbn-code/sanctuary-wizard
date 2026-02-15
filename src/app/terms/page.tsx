import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-sanctuary-bg p-8 md:p-24 text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-sanctuary-primary font-bold hover:underline mb-8">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 text-sanctuary-primary">
          <Scale size={40} />
          <h1 className="text-4xl font-bold font-sacramento text-gray-800">Terms of Service</h1>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-sanctuary-soft text-gray-800">
          <p className="font-bold text-gray-700">Effective Date: February 14, 2026</p>
          
          <h2 className="text-xl font-bold text-sanctuary-primary mt-6">1. Acceptance of Terms</h2>
          <p>
            By using Sanctuary Wizard, you agree to these terms. You must be at least 18 years of age to use this service. If you do not agree or do not meet the age requirement, please do not use the service.
          </p>

          <h2 className="text-xl font-bold text-sanctuary-primary mt-6">2. Description of Service</h2>
          <p>
            We provide a digital tool to create personalized, interactive web pages. Paid tiers unlock additional customization features.
          </p>

          <h2 className="text-xl font-bold text-sanctuary-primary mt-6">3. Payments and Refunds</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Final Sale:</strong> Due to the nature of digital goods and immediate asset processing costs, all purchases are final. We do not offer refunds once a premium link has been generated.</li>
            <li><strong>Technical Issues:</strong> We are not responsible for malfunctions caused by user error. Refunds will not be issued even in cases of technical difficulty, as the service is provided "as-is".</li>
            <li><strong>One-time Payment:</strong> Payments are one-time fees, not recurring subscriptions.</li>
          </ul>

          <h2 className="text-xl font-bold text-sanctuary-primary mt-6">4. User Conduct and Prohibited Content</h2>
          <p>
            You are solely responsible for the photos, videos, and text you upload. You agree not to upload any content that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Is illegal, harmful, threatening, or promotes violence.</li>
            <li>Contains nudity, sexually explicit material, or is otherwise inappropriate.</li>
            <li>Infringes on the intellectual property rights of others.</li>
            <li>Contains viruses, malware, or any other malicious code.</li>
          </ul>

          <h2 className="text-xl font-bold text-sanctuary-primary mt-6">5. Intellectual Property</h2>
          <p>
            We respect intellectual property. If you believe your work has been copied in a way that constitutes infringement, please contact us at <span className="font-bold">malthe@mbn-code.dk</span>.
          </p>

          <h2 className="text-xl font-bold text-sanctuary-primary mt-6">6. Data Deletion</h2>
          <p>
            We provide a "Revoke" feature to remove your media. Please note that once deleted, assets cannot be recovered.
          </p>

          <h2 className="text-xl font-bold text-sanctuary-primary mt-6 text-gray-800">7. Limitation of Liability</h2>
          <p>
            The service is provided "as is". To the fullest extent permitted by law, Sanctuary Wizard and its creators shall not be liable for any damages arising out of your use of the service.
          </p>

          <h2 className="text-xl font-bold text-sanctuary-primary mt-6">8. Contact</h2>
          <p>
            For support or legal inquiries, contact <span className="font-bold">malthe@mbn-code.dk</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
