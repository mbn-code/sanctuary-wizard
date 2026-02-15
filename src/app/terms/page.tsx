import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-valentine-cream p-8 md:p-24 text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-valentine-red font-bold hover:underline mb-8">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 text-valentine-red">
          <Scale size={40} />
          <h1 className="text-4xl font-bold font-sacramento">Terms of Service</h1>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-valentine-soft">
          <p className="font-bold text-gray-700">Effective Date: February 14, 2026</p>
          
          <h2 className="text-xl font-bold text-valentine-red mt-6">1. Acceptance of Terms</h2>
          <p>
            By using Valentine Wizard, you agree to these terms. You must be at least 18 years of age to use this service. If you do not agree or do not meet the age requirement, please do not use the service.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">2. Description of Service</h2>
          <p>
            We provide a digital tool to create personalized, interactive web pages. Paid tiers ("The Romance" and "The Sanctuary") unlock additional customization features.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">3. Payments and Refunds</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Final Sale:</strong> Due to the nature of digital goods and immediate asset processing costs, all purchases are final. We do not offer refunds once a premium link has been generated.</li>
            <li><strong>Technical Issues:</strong> We are not responsible for malfunctions caused by user error (e.g., uploading incompatible file formats, accidental deletion, or providing incorrect information). Refunds will not be issued even in cases of technical difficulty, as the service is provided "as-is".</li>
            <li><strong>One-time Payment:</strong> Payments are one-time fees, not recurring subscriptions.</li>
          </ul>

          <h2 className="text-xl font-bold text-valentine-red mt-6">4. User Conduct and Prohibited Content</h2>
          <p>
            You are solely responsible for the photos, videos, and text you upload. You agree not to upload any content that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Is illegal, harmful, threatening, or promotes violence.</li>
            <li>Contains nudity, sexually explicit material, or is otherwise inappropriate.</li>
            <li>Infringes on the intellectual property rights (copyright, trademark) of others.</li>
            <li>Contains viruses, malware, or any other malicious code.</li>
          </ul>
          <p className="mt-4">
            We reserve the right to remove any content reported to us that violates these terms without notice. Uploading content that exceeds browser URL limits may cause your link to fail.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">5. Intellectual Property and DMCA</h2>
          <p>
            We respect the intellectual property of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please contact us at <span className="font-bold">malthe@mbn-code.dk</span> with a formal takedown request.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">6. Data Deletion</h2>
          <p>
            We provide a "Delete" feature to remove your media. Please note that once deleted, assets cannot be recovered and the service will no longer function for that specific link.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">7. Limitation of Liability and Indemnification</h2>
          <p>
            The service is provided "as is". To the fullest extent permitted by law, Valentine Wizard and its creators shall not be liable for any damages arising out of your use of the service. You agree to indemnify and hold harmless Valentine Wizard from any claims, losses, or liabilities resulting from your use of the service or violation of these terms.
          </p>

          <h2 className="text-xl font-bold text-valentine-red mt-6">8. Contact</h2>
          <p>
            For support or legal inquiries, contact <span className="font-bold">malthe@mbn-code.dk</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
