import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export const NewsletterSection: React.FC = () => {
  const { showToast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    // Simulated subscription call
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubscribed(true);
    showToast(`Subscribed! Weekly harvest digest sent to ${data.email}`, 'success');
    reset();
  };

  return (
    <section className="py-14 sm:py-16 bg-brand-900 text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-brand-800 text-brand-300 mx-auto flex items-center justify-center mb-4 shadow-soft">
          <Mail className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Get Fresh Offers in Your Inbox
        </h2>
        <p className="text-xs sm:text-sm text-brand-200 mt-2 max-w-lg mx-auto">
          Subscribe to our weekly farm newsletter for seasonal harvest alerts, chef recipes, and exclusive subscriber coupon drops.
        </p>

        {isSubscribed ? (
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-800 border border-brand-700 text-white text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-brand-400" />
            Thank you for subscribing! Check your email for a special ₹50 welcome discount code.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 relative">
              <input
                {...register('email')}
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-2xl bg-white text-charcoal placeholder-charcoal-muted text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-400 shadow-soft"
              />
              {errors.email && (
                <p className="text-rose-300 text-[11px] mt-1 text-left sm:absolute -bottom-5 left-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold shrink-0"
            >
              {isSubmitting ? 'Joining...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
