import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'Bengaluru',
    role: 'Verified Shopper (Sample Data)',
    comment: 'The Royal Gala apples and fresh spinach arrived in pristine condition! Knowing the harvest date on every pack gives me total peace of mind for my family.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Rohan Mehta',
    city: 'Mumbai',
    role: 'Verified Shopper (Sample Data)',
    comment: 'The morning delivery slot between 7-10 AM is a lifesaver. Everything from whole wheat sourdough to fresh milk was at my doorstep before breakfast.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Dr. Ananya Sen',
    city: 'New Delhi',
    role: 'Verified Shopper (Sample Data)',
    comment: 'As someone who prioritizes organic chemical-free produce, FreshGrocer has been our go-to for 6 months. Cash on delivery makes checkout so convenient.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
            Community Love
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
            What Our Shoppers Say
          </h2>
          <p className="text-xs text-charcoal-muted mt-1 italic">
            Sample customer feedback collected from verified deliveries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-surface rounded-3xl p-6 sm:p-7 border border-surface-border shadow-card flex flex-col justify-between relative"
            >
              <Quote className="w-8 h-8 text-brand-200 absolute top-6 right-6 opacity-60" />

              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-charcoal leading-relaxed mb-6 font-medium">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-surface-border">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-brand-200"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-charcoal flex items-center gap-1">
                    {t.name}
                    <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
                  </h4>
                  <p className="text-[11px] text-charcoal-muted">
                    {t.city} • {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
