import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    total,
    remainingForFreeDelivery,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 overflow-hidden bg-charcoal/50 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal">Your Shopping Basket</h3>
                  <p className="text-xs text-charcoal-muted">{itemCount} items</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close basket"
                className="p-1.5 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Delivery Tracker */}
            {items.length > 0 && (
              <div className="bg-brand-50 px-4 py-2.5 border-b border-brand-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                <p className="text-xs text-brand-900 font-medium">
                  {remainingForFreeDelivery > 0 ? (
                    <>
                      Add <strong className="font-bold">₹{remainingForFreeDelivery.toFixed(2)}</strong> more to get <strong className="underline">FREE delivery</strong>!
                    </>
                  ) : (
                    <strong className="text-brand-700 font-bold">🎉 You have unlocked FREE Delivery!</strong>
                  )}
                </p>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-charcoal">Your basket is empty</h4>
                  <p className="text-xs text-charcoal-muted mt-1 mb-5 max-w-xs">
                    Explore our freshest fruits, vegetables, and daily essentials.
                  </p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="btn-primary text-xs py-2.5 px-5"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-surface-border bg-surface-card hover:border-brand-200 transition-colors"
                  >
                    {/* Item Image */}
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-contain bg-surface-subtle p-1 shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="text-xs sm:text-sm font-semibold text-charcoal hover:text-brand-700 truncate block"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-[11px] text-charcoal-muted block">
                        {item.product.unit}
                      </span>
                      <span className="text-xs font-bold text-charcoal mt-1 block">
                        ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Stepper & Remove */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-charcoal-muted hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 bg-surface-subtle border border-surface-border rounded-xl p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-charcoal hover:bg-stone-200 text-xs transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          aria-label="Increase quantity"
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 text-xs transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-surface-border bg-surface-subtle space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-charcoal-muted">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-muted">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-accent-700 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-surface-border flex justify-between text-base font-bold text-charcoal">
                    <span>Total Amount</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setIsClearModalOpen(true)}
                    className="btn-secondary text-xs py-2.5 px-3 rounded-xl"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCheckoutClick}
                    className="flex-1 btn-primary py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear Basket"
        message="Are you sure you want to remove all items from your shopping basket?"
        confirmLabel="Yes, Clear Basket"
        isDestructive={true}
        onConfirm={() => {
          clearCart();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </>
  );
};
