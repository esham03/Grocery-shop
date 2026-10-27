import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { ArrowRight } from 'lucide-react';

interface CategorySectionProps {
  categories: Category[];
  isLoading?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categories, isLoading }) => {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
              Explore Our Aisles
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 group"
          >
            <span>Browse all categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col items-center p-3 rounded-2xl border border-surface-border">
                  <div className="w-16 h-16 bg-stone-200 rounded-2xl mb-2" />
                  <div className="h-3 w-16 bg-stone-200 rounded" />
                </div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center p-3.5 rounded-2xl border border-surface-border/80 bg-surface hover:bg-white hover:border-brand-500/50 hover:shadow-card transition-all duration-200"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white p-1 mb-2.5 shadow-xs border border-surface-border group-hover:scale-105 transition-transform">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-brand-700 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  {cat.product_count !== undefined && (
                    <span className="text-[11px] text-charcoal-muted mt-0.5">
                      {cat.product_count} items
                    </span>
                  )}
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};
