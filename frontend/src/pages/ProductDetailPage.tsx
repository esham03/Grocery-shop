import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/common/ProductCard';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [imgSrc, setImgSrc] = useState<string>('');

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const data = await api.getProductBySlug(slug!);
      setImgSrc(data.image_url || FALLBACK_IMAGE);
      return data;
    },
    enabled: !!slug,
  });

  // Fetch related products in same category
  const { data: relatedData } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () =>
      api.getProducts({
        category: typeof product?.category === 'object' ? product?.category.id : product?.category,
        page_size: 4,
      }),
    enabled: !!product?.category,
  });

  const cartQuantity = product ? getItemQuantity(product.id) : 0;
  const isOutOfStock = product ? product.stock_quantity <= 0 : false;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-4 w-48 bg-stone-200 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-stone-200 rounded" />
            <div className="h-4 w-1/4 bg-stone-200 rounded" />
            <div className="h-10 w-1/3 bg-stone-200 rounded" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-charcoal mb-2">Product Not Found</h2>
        <p className="text-xs text-charcoal-muted mb-6">
          The requested grocery item is no longer available or was moved.
        </p>
        <Link to="/shop" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Return to Shop
        </Link>
      </div>
    );
  }

  const categoryName =
    product.category_name || (typeof product.category === 'object' ? product.category.name : 'Groceries');

  const relatedProducts = (relatedData?.results || []).filter((p) => p.id !== product.id);

  return (
    <div className="py-8 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-charcoal-muted mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-charcoal">{product.name}</span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card mb-12">
          {/* Left Column: Product Image */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square rounded-2xl bg-surface-subtle p-6 flex items-center justify-center overflow-hidden border border-surface-border">
              {product.discount_percentage && product.discount_percentage > 0 ? (
                <span className="badge-discount absolute top-4 left-4 z-10 text-xs">
                  {product.discount_percentage}% OFF
                </span>
              ) : null}

              <img
                src={imgSrc || product.image_url}
                alt={product.name}
                onError={() => setImgSrc(FALLBACK_IMAGE)}
                className="max-h-full max-w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Column: Pricing & Purchasing Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-1">
                  {categoryName}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
                  {product.name}
                </h1>
                <p className="text-sm font-semibold text-charcoal-muted mt-1">
                  Net Weight: <strong className="text-charcoal">{product.unit}</strong>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <RatingStars rating={product.rating} reviewCount={product.review_count} size="md" />
                <span className="text-xs text-charcoal-muted">• Verified Harvest</span>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-charcoal">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  {product.original_price && Number(product.original_price) > Number(product.price) && (
                    <span className="text-sm text-charcoal-muted line-through">
                      ₹{Number(product.original_price).toFixed(2)}
                    </span>
                  )}
                  {product.discount_percentage && product.discount_percentage > 0 ? (
                    <span className="text-xs font-bold text-accent-700 bg-accent-100 px-2.5 py-0.5 rounded-full">
                      Save ₹{(Number(product.original_price) - Number(product.price)).toFixed(2)}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-charcoal-muted mt-1">
                  Prices inclusive of all applicable taxes. Free delivery on total cart over ₹499.
                </p>
              </div>

              {/* Stock Status Badge */}
              <div>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                    Currently Out of Stock
                  </span>
                ) : product.stock_quantity <= product.min_stock_level ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    Low Stock: Only {product.stock_quantity} left in batch!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    In Stock (Fresh Batch Ready for Delivery)
                  </span>
                )}
              </div>

              {/* Quantity Stepper & Add to Basket */}
              {!isOutOfStock && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-surface-subtle p-1.5 rounded-2xl border border-surface-border">
                    <span className="text-xs text-charcoal-muted px-2 font-medium">Qty:</span>
                    <button
                      onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                      disabled={selectedQty <= 1}
                      aria-label="Decrease quantity"
                      className="w-8 h-8 rounded-xl bg-white border border-surface-border flex items-center justify-center text-charcoal hover:bg-stone-100 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-charcoal">
                      {selectedQty}
                    </span>
                    <button
                      onClick={() => setSelectedQty((q) => Math.min(product.stock_quantity, q + 1))}
                      disabled={selectedQty >= product.stock_quantity}
                      aria-label="Increase quantity"
                      className="w-8 h-8 rounded-xl bg-white border border-surface-border flex items-center justify-center text-charcoal hover:bg-stone-100 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (cartQuantity > 0) {
                        updateQuantity(product.id, cartQuantity + selectedQty);
                      } else {
                        addToCart(product, selectedQty);
                      }
                    }}
                    className="flex-1 btn-primary py-3.5 px-6 rounded-2xl text-sm font-semibold shadow-soft"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{cartQuantity > 0 ? `Add ${selectedQty} More to Cart (In Cart: ${cartQuantity})` : `Add to Shopping Cart`}</span>
                  </button>
                </div>
              )}

              {/* Description */}
              <div className="pt-4 border-t border-surface-border space-y-2">
                <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  Product Overview
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Delivery Guarantees */}
              <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-charcoal-muted">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-subtle">
                  <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Choose convenient morning, afternoon or evening slots.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-subtle">
                  <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Doorstep quality check with full return support.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
                More from {categoryName}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
