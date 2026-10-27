import React, { useState } from 'react';
import { Tag, Copy, Check, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const OffersBanner: React.FC = () => {
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="py-10 bg-white border-y border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Offer 1: FRESH50 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-brand-800 p-6 sm:p-8 text-white shadow-card flex flex-col justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                <Tag className="w-3.5 h-3.5" /> Weekend Grocery Special
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                FLAT ₹50 OFF
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-sm">
                Save on fresh fruits, vegetables, and daily staples on orders above ₹299.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider block">Promo Code</span>
                <span className="text-lg font-black tracking-widest text-accent-300">FRESH50</span>
              </div>
              <button
                onClick={() => handleCopy('FRESH50')}
                className="inline-flex items-center gap-1.5 bg-white text-emerald-900 px-4 py-2 rounded-xl text-xs font-bold shadow-soft hover:bg-emerald-50 active:scale-95 transition-all"
              >
                {copiedCode === 'FRESH50' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'FRESH50' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Offer 2: WELCOME100 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-charcoal to-stone-800 p-6 sm:p-8 text-white shadow-card flex flex-col justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" /> New Shopper Welcome
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                ₹100 DISCOUNT
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-sm">
                Get ₹100 off on your first order of ₹499 or more, plus automatically qualify for FREE delivery.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Promo Code</span>
                <span className="text-lg font-black tracking-widest text-accent-400">WELCOME100</span>
              </div>
              <button
                onClick={() => handleCopy('WELCOME100')}
                className="inline-flex items-center gap-1.5 bg-accent-500 text-charcoal px-4 py-2 rounded-xl text-xs font-bold shadow-soft hover:bg-accent-400 active:scale-95 transition-all"
              >
                {copiedCode === 'WELCOME100' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'WELCOME100' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
