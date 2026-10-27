import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Truck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-surface py-12 md:py-20 border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-800 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              100% Farm-Fresh & Organic Harvests
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal tracking-tight leading-[1.15]">
              Fresh Groceries. <br />
              <span className="text-brand-600">Delivered with Care.</span>
            </h1>

            <p className="text-base sm:text-lg text-charcoal-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Directly connecting local farmers with your kitchen. Enjoy handpicked seasonal fruits, crisp farm vegetables, pure dairy, and pantry essentials delivered straight to your door.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/shop" className="btn-primary w-full sm:w-auto text-sm sm:text-base py-3 px-7 rounded-2xl shadow-card">
                <span>Shop Fresh Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?offers=true" className="btn-secondary w-full sm:w-auto text-sm sm:text-base py-3 px-6 rounded-2xl">
                <span>View Special Offers</span>
              </Link>
            </div>

            {/* Value Badges */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-surface-border max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Quick Delivery</h4>
                  <p className="text-[11px] text-charcoal-muted">Slot chosen by you</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Direct Farm</h4>
                  <p className="text-[11px] text-charcoal-muted">No middlemen</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Pay COD</h4>
                  <p className="text-[11px] text-charcoal-muted">Inspect then pay</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Photography */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-300 to-accent-200 rounded-3xl blur-2xl opacity-40 -z-10" />

              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1587049352822-999e1d8c5216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&q=80"
                  alt="Fresh organic fruits and vegetables from FreshGrocer"
                  className="w-full h-[360px] sm:h-[420px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Floating Floating Offer Badge */}
              <div className="absolute -bottom-5 -left-4 sm:left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lift border border-surface-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center font-bold text-sm">
                  ₹50
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal">Flat ₹50 OFF</p>
                  <p className="text-[11px] text-charcoal-muted">Use coupon: <code className="text-brand-700 font-bold">FRESH50</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
