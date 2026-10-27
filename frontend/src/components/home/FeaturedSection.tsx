import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';
import { ProductGridSkeleton } from '../common/LoadingSkeleton';

interface FeaturedSectionProps {
  products: Product[];
  isLoading?: boolean;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ products, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers'>('featured');

  const filteredProducts = products.filter((p) =>
    activeTab === 'featured' ? p.is_featured : p.is_bestseller
  );

  return (
    <section className="py-12 sm:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
              Top Quality Picks
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
              Handpicked For You
            </h2>
          </div>

          {/* Toggle Filter Tabs */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-surface-border shadow-soft self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'featured'
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Featured Produce
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'bestsellers'
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Best Sellers
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-charcoal-muted text-sm">
            No products in this section currently.
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/shop" className="btn-secondary py-3 px-8 text-sm font-semibold rounded-2xl shadow-soft">
            <span>Explore All {products.length}+ Groceries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
