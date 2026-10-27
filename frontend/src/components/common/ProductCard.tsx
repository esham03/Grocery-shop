import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { RatingStars } from './RatingStars';

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const [imgSrc, setImgSrc] = useState<string>(product.image_url || FALLBACK_IMAGE);

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div
      className={`group card-premium flex flex-col justify-between overflow-hidden relative transition-all duration-200 ${
        isOutOfStock ? 'opacity-80' : 'hover:border-brand-500/40'
      }`}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {product.discount_percentage && product.discount_percentage > 0 ? (
          <span className="badge-discount">{product.discount_percentage}% OFF</span>
        ) : product.is_featured ? (
          <span className="badge-category font-semibold">Featured</span>
        ) : (
          <div />
        )}

        {isOutOfStock && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Image & Link */}
      <Link
        to={`/product/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-surface-subtle p-4"
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="bg-white/95 text-charcoal px-3 py-1.5 rounded-full text-xs font-semibold shadow-soft flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          <span className="text-xs font-medium text-brand-700 uppercase tracking-wider block mb-1">
            {product.category_name || (typeof product.category === 'object' ? product.category.name : 'Fresh Grocery')}
          </span>

          {/* Name */}
          <Link
            to={`/product/${product.slug}`}
            className="text-base font-semibold text-charcoal hover:text-brand-700 transition-colors line-clamp-1 block"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Unit / Weight */}
          <span className="text-xs text-charcoal-muted mt-0.5 block">
            {product.unit}
          </span>

          {/* Rating */}
          <div className="mt-2">
            <RatingStars rating={product.rating} reviewCount={product.review_count} />
          </div>
        </div>

        {/* Pricing and Action Button */}
        <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between gap-2">
          {/* Prices */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-charcoal">
                ₹{Number(product.price).toFixed(2)}
              </span>
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <span className="text-xs text-charcoal-muted line-through">
                  ₹{Number(product.original_price).toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-charcoal-muted block">
              Inclusive of all taxes
            </span>
          </div>

          {/* Interactive Cart Button / Stepper */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
              >
                Sold Out
              </button>
            ) : quantity > 0 ? (
              <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 rounded-xl p-1 shadow-soft">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  aria-label={`Decrease quantity of ${product.name}`}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-brand-700 hover:bg-brand-100 transition-colors shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-brand-900">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock_quantity}
                  aria-label={`Increase quantity of ${product.name}`}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, 1)}
                className="btn-primary text-xs py-2 px-3.5 rounded-xl shadow-soft"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
