import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Clock, MapPin, AlertCircle, ShoppingBag, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Order, OrderStatus } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';

const STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  PROCESSING: { label: 'Processing at Hub', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  DELIVERED: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export const MyOrdersPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Ordered by mistake');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.getMyOrders(),
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.cancelOrder(id, reason),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData<Order[]>(['my-orders'], (prev = []) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      showToast(`Order ${updatedOrder.order_number} cancelled successfully.`, 'info');
      setOrderToCancel(null);
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Could not cancel order.', 'error');
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 bg-surface min-h-[70vh] flex items-center justify-center text-center">
        <div className="max-w-md p-8 bg-white rounded-3xl border border-surface-border shadow-soft space-y-4">
          <Package className="w-12 h-12 text-brand-600 mx-auto" />
          <h2 className="text-xl font-bold text-charcoal">Sign In to View Orders</h2>
          <p className="text-xs text-charcoal-muted">
            Please log in with your FreshGrocer account to access your delivery history and tracking status.
          </p>
          <button onClick={() => openAuthModal('login')} className="btn-primary w-full py-2.5">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-surface min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
            My Order History
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Track past grocery shipments, view historical receipts, and manage active deliveries.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-surface-border" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-surface-border shadow-soft">
            <EmptyState
              icon={ShoppingBag}
              title="No Orders Yet"
              description="You haven't placed any grocery orders yet. Discover seasonal fruits, farm-fresh vegetables, and dairy!"
              actionText="Start Shopping"
              actionHref="/shop"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusBadge = STATUS_BADGES[order.status] || {
                label: order.status,
                className: 'bg-stone-100 text-stone-800 border-stone-200',
              };

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="p-4 sm:p-6 bg-surface-subtle border-b border-surface-border flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-charcoal">
                          {order.order_number}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-charcoal-muted text-[11px]">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[11px] text-charcoal-muted block">Total Paid (COD)</span>
                        <span className="text-base font-extrabold text-brand-700">
                          ₹{Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>

                      {order.can_cancel && (
                        <button
                          onClick={() => setOrderToCancel(order)}
                          className="btn-secondary text-xs py-1.5 px-3 rounded-xl text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div className="p-4 sm:p-6 space-y-6">
                    {/* Delivery Slot & Address Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface border border-surface-border">
                        <Clock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-charcoal block">Delivery Slot</strong>
                          <span className="text-charcoal-muted">
                            {order.delivery_slot_name} ({order.delivery_slot_window})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface border border-surface-border">
                        <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-charcoal block">Delivered To</strong>
                          <span className="text-charcoal-muted block truncate max-w-xs">
                            {order.shipping_full_name} • {order.shipping_address_line1}, {order.shipping_city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Immutable Item Snapshots */}
                    <div>
                      <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
                        Items Purchased ({order.items.length})
                      </h4>
                      <div className="divide-y divide-surface-border border border-surface-border rounded-2xl overflow-hidden">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-white flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              {item.product_image && (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-10 h-10 object-contain rounded-lg bg-surface-subtle p-1 shrink-0"
                                />
                              )}
                              <div>
                                <span className="font-bold text-charcoal">{item.product_name}</span>
                                <span className="text-charcoal-muted block text-[11px]">
                                  {item.quantity} x {item.product_unit} (₹{Number(item.unit_price).toFixed(2)})
                                </span>
                              </div>
                            </div>
                            <span className="font-bold text-charcoal">
                              ₹{Number(item.subtotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.cancellation_reason && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                        <strong>Cancellation Reason:</strong> {order.cancellation_reason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      {orderToCancel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-lift border border-surface-border">
            <h3 className="text-lg font-bold text-charcoal mb-2">
              Cancel Order #{orderToCancel.order_number}
            </h3>
            <p className="text-xs text-charcoal-muted mb-4">
              Are you sure you want to cancel this order? Reserved inventory will be returned to stock.
            </p>

            <label className="block text-xs font-semibold text-charcoal mb-1">
              Reason for cancellation:
            </label>
            <select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-surface-border text-xs mb-6 focus:outline-hidden focus:border-brand-500"
            >
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Delivery slot inconvenient">Delivery slot inconvenient</option>
              <option value="Found better alternative">Found better alternative</option>
              <option value="Want to modify items">Want to modify items</option>
              <option value="Other">Other reason</option>
            </select>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setOrderToCancel(null)}
                className="btn-secondary text-xs py-2 px-4 rounded-xl"
              >
                Keep Order
              </button>
              <button
                onClick={() =>
                  cancelMutation.mutate({
                    id: orderToCancel.id,
                    reason: cancellationReason,
                  })
                }
                disabled={cancelMutation.isPending}
                className="text-xs py-2 px-4 rounded-xl font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
