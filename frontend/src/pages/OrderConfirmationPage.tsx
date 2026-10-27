import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, MapPin, Package, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const stateOrder = location.state?.order as Order | undefined;

  const { data: fetchedOrder, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.getOrderById(id!),
    enabled: !stateOrder && !!id,
  });

  const order = stateOrder || fetchedOrder;

  if (isLoading) {
    return (
      <div className="py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-stone-200 rounded-full mx-auto mb-4" />
        <div className="h-6 w-48 bg-stone-200 rounded mx-auto mb-2" />
        <div className="h-4 w-64 bg-stone-200 rounded mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-charcoal mb-2">Order Not Found</h2>
        <p className="text-xs text-charcoal-muted mb-6">
          Could not find order details. Please check your order history.
        </p>
        <Link to="/orders" className="btn-primary">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-border shadow-card text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-soft">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="badge-category font-bold text-xs mb-2">
            Order Status: {order.status}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            Thank You! Your Order is Confirmed
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-2 max-w-md mx-auto">
            Order Number: <strong className="text-charcoal font-bold tracking-wider">{order.order_number}</strong>
          </p>

          {/* Delivery Window Callout */}
          <div className="mt-6 p-4 rounded-2xl bg-brand-50 border border-brand-200 inline-flex flex-col sm:flex-row items-center gap-3 text-left">
            <Clock className="w-5 h-5 text-brand-700 shrink-0" />
            <div className="text-xs text-brand-900">
              <span className="font-bold block">Delivery Window Scheduled:</span>
              <span>{order.delivery_slot_name} ({order.delivery_slot_window})</span>
            </div>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-6 mb-8">
          {/* Shipping Address Snapshot */}
          <div className="pb-6 border-b border-surface-border">
            <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
            </h3>
            <p className="text-sm font-bold text-charcoal">{order.shipping_full_name} ({order.shipping_phone})</p>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {order.shipping_address_line1}{order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''}
            </p>
            <p className="text-xs text-charcoal-muted">
              {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}
            </p>
          </div>

          {/* Order Items */}
          <div className="pb-6 border-b border-surface-border space-y-3">
            <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-brand-600" /> Items in this Order
            </h3>
            <div className="divide-y divide-surface-border">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-charcoal">{item.quantity}x {item.product_name}</span>
                    <span className="text-charcoal-muted block text-[11px]">{item.product_unit}</span>
                  </div>
                  <span className="font-bold text-charcoal">
                    ₹{Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-charcoal-muted">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Delivery Fee</span>
              <span>{Number(order.delivery_fee) === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${Number(order.delivery_fee).toFixed(2)}`}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-accent-700 font-bold">
                <span>Coupon Discount ({order.coupon_code})</span>
                <span>-₹{Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-surface-border flex justify-between text-base font-extrabold text-charcoal">
              <span>Amount Due on Delivery (Cash / UPI)</span>
              <span className="text-brand-700">₹{Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/orders" className="btn-primary w-full sm:w-auto py-3 px-6 rounded-2xl text-xs sm:text-sm font-semibold">
            <span>Track in My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/shop" className="btn-secondary w-full sm:w-auto py-3 px-6 rounded-2xl text-xs sm:text-sm font-semibold">
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
