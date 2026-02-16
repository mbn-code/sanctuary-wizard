import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFCFB] text-slate-900 p-6 text-center">
      <div className="space-y-6">
        <div className="w-20 h-20 bg-sanctuary-primary/10 rounded-[32px] flex items-center justify-center mx-auto text-sanctuary-primary">
          <Sparkles size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-serif-display leading-none">404</h1>
          <p className="text-slate-500 font-playfair italic text-xl">This moment couldn't be found.</p>
        </div>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:scale-105 transition-all text-xs uppercase tracking-widest shadow-lg"
        >
          <ArrowLeft size={16} /> Return Home
        </Link>
      </div>
    </div>
  );
}
