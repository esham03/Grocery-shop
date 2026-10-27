import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    total,
    remainingForFreeDelivery,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponInput.trim());
    if (success) setCouponInput('');
    setIsApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="py-20 bg-surface min-h-[70vh] flex items-center justify-center">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Explore our handpicked organic fruits, farm vegetables, pure dairy, and bakery treats to fill your basket."
          actionText="Explore Fresh Produce"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="py-10 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Review your items and proceed to secure doorstep delivery.
            </p>
          </div>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="self-start sm:self-auto text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="p-4 mb-8 rounded-2xl bg-brand-50 border border-brand-200 flex items-center gap-3 shadow-soft">
          <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
          <div className="flex-1 text-xs text-brand-900 font-medium">
            {remainingForFreeDelivery > 0 ? (
              <>
                Add items worth <strong className="font-bold">₹{remainingForFreeDelivery.toFixed(2)}</strong> more to get <strong className="underline font-bold">FREE standard delivery</strong>!
              </>
            ) : (
              <span className="text-brand-800 font-bold">
                🎉 Congratulations! Your order qualifies for FREE Doorstep Delivery.
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Items Column */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card divide-y divide-surface-border">
            {items.map((item) => (
              <div key={item.product.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Product Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-2xl object-contain bg-surface-subtle p-2 shrink-0 border border-surface-border"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider block">
                      {item.product.category_name || (typeof item.product.category === 'object' ? item.product.category.name : 'Produce')}
                    </span>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-sm sm:text-base font-bold text-charcoal hover:text-brand-700 transition-colors block truncate"
                    >
                      {item.product.name}
                    </Link>
                    <span className="text-xs text-charcoal-muted block mt-0.5">
                      Unit: {item.product.unit} (₹{Number(item.product.price).toFixed(2)} each)
                    </span>
                  </div>
                </div>

                {/* Stepper & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-surface-subtle border border-surface-border rounded-xl p-1 shadow-soft">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-charcoal hover:bg-stone-200 text-xs transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                      aria-label="Increase quantity"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 text-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-base font-bold text-charcoal block">
                      ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Promo Code Card */}
            <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-brand-600" /> Apply Discount Coupon
              </h3>

              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> {appliedCoupon.code} Applied!
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Saved ₹{discount.toFixed(2)} on your basket
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. FRESH50"
                      className="flex-1 px-3 py-2 rounded-xl border border-surface-border text-xs uppercase tracking-wider font-semibold focus:outline-hidden focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="btn-primary text-xs py-2 px-4 rounded-xl"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    Try using <strong className="text-charcoal font-bold">FRESH50</strong> (orders &gt; ₹299) or <strong className="text-charcoal font-bold">WELCOME100</strong> (orders &gt; ₹499).
                  </p>
                </form>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card space-y-4">
              <h3 className="text-base font-bold text-charcoal pb-3 border-b border-surface-border">
                Order Bill Summary
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-charcoal-muted">
                  <span>Basket Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-charcoal">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-charcoal-muted">
                  <span>Estimated Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <strong className="text-emerald-700 font-bold">FREE</strong>
                    ) : (
                      `₹${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-accent-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-surface-border flex justify-between text-base font-extrabold text-charcoal">
                  <span>To Pay (COD)</span>
                  <span className="text-brand-700">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary py-3.5 rounded-2xl text-sm font-semibold shadow-soft flex items-center justify-center gap-2 mt-4"
              >
                <span>Proceed to Delivery & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear All Items"
        message="Are you sure you want to clear your entire cart? You can re-add items anytime from the shop."
        confirmLabel="Clear Cart"
        isDestructive={true}
        onConfirm={() => {
          clearCart();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
