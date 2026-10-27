import React from 'react';
import { Leaf, ShieldCheck, Clock, ThumbsUp } from 'lucide-react';

const REASONS = [
  {
    icon: Leaf,
    title: 'Farm-Fresh Harvests',
    description: 'We partner directly with certified local farmers so your fruits and greens are harvested within hours of delivery.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Chemical Ripening',
    description: 'No calcium carbide, wax sprays, or chemical accelerants. Only naturally sun-ripened wholesome produce.',
  },
  {
    icon: Clock,
    title: 'Reliable Time Slots',
    description: 'Choose your preferred 3-hour morning, afternoon, or evening window so your delivery matches your day.',
  },
  {
    icon: ThumbsUp,
    title: 'No-Questions Replacement',
    description: 'If you are ever unsatisfied with any item in your basket, our doorstep return policy ensures instant refund.',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-surface border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
            Our Promise
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Why Choose FreshGrocer?
          </h2>
          <p className="text-sm text-charcoal-muted mt-2">
            Committed to freshness, transparent sourcing, and doorstep reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REASONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-surface-border shadow-card hover:shadow-lift transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 shadow-soft">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-charcoal mb-2">{item.title}</h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
