import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Address } from '../types';

const addressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone_number: z.string().min(10, 'Valid 10-digit phone number is required'),
  address_line1: z.string().min(5, 'Address line 1 is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(5, 'Valid postal code is required'),
  delivery_instructions: z.string().optional(),
  is_default: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { items, itemCount, subtotal, deliveryFee, discount, total, appliedCoupon, clearCart } = useCart();
  const { showToast } = useToast();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch Addresses
  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.getAddresses(),
    enabled: isAuthenticated,
  });

  // Auto-select default address
  React.useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Fetch Delivery Slots
  const { data: deliverySlots = [] } = useQuery({
    queryKey: ['delivery-slots'],
    queryFn: () => api.getDeliverySlots(),
  });

  // Auto-select first slot
  React.useEffect(() => {
    if (deliverySlots.length > 0 && selectedSlotId === null) {
      setSelectedSlotId(deliverySlots[0].id);
    }
  }, [deliverySlots, selectedSlotId]);

  // Form for adding new address
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors, isSubmitting: isSubmittingAddress },
    reset: resetAddressForm,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: user ? `${user.first_name} ${user.last_name}`.trim() : '',
      phone_number: user?.phone_number || '',
      city: 'Bengaluru',
      state: 'Karnataka',
      is_default: addresses.length === 0,
    },
  });

  const onAddAddress = async (data: AddressFormData) => {
    try {
      const created = await api.createAddress(data as unknown as Omit<Address, 'id'>);
      await refetchAddresses();
      setSelectedAddressId(created.id);
      setIsAddingNewAddress(false);
      resetAddressForm();
      showToast('Delivery address saved!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not save address.', 'error');
    }
  };

  // Order placement mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) throw new Error('Please select or provide a delivery address.');
      if (!selectedSlotId) throw new Error('Please choose a delivery time slot.');

      return api.createOrder({
        address_id: selectedAddressId,
        delivery_slot_id: selectedSlotId,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      });
    },
    onSuccess: (order) => {
      clearCart();
      showToast('Order confirmed successfully!', 'success');
      navigate(`/order-confirmation/${order.id}`, { state: { order } });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Order placement failed.';
      setOrderError(msg);
      showToast(msg, 'error');
    },
  });

  // If user is guest, prompt to authenticate
  if (!isAuthenticated) {
    return (
      <div className="py-20 bg-surface min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-surface-border shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-charcoal">Sign In to Complete Order</h2>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Please log in or create an account to save your delivery address and receive live shipment updates. Your basket items will be preserved!
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="btn-primary w-full py-3 rounded-xl font-semibold text-sm"
            >
              Sign In to Continue
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="btn-secondary w-full py-3 rounded-xl font-semibold text-sm"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 bg-surface min-h-[70vh] flex items-center justify-center text-center">
        <div className="max-w-md p-8 bg-white rounded-3xl border border-surface-border shadow-soft">
          <h2 className="text-xl font-bold text-charcoal mb-2">No Items in Basket</h2>
          <p className="text-xs text-charcoal-muted mb-6">
            You cannot proceed to checkout with an empty basket.
          </p>
          <Link to="/shop" className="btn-primary">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
              Checkout & Delivery
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Select your delivery address, slot, and confirm your fresh grocery order.
            </p>
          </div>
          <Link to="/cart" className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Basket
          </Link>
        </div>

        {orderError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Form Steps Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
                  </h3>
                </div>

                {!isAddingNewAddress && (
                  <button
                    onClick={() => setIsAddingNewAddress(true)}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                )}
              </div>

              {/* Address List */}
              {!isAddingNewAddress ? (
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-charcoal-muted mb-3">
                        No delivery address found. Please add an address to continue.
                      </p>
                      <button
                        onClick={() => setIsAddingNewAddress(true)}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        Add Delivery Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                          selectedAddressId === addr.id
                            ? 'bg-brand-50/50 border-brand-500 shadow-soft ring-2 ring-brand-100'
                            : 'border-surface-border hover:bg-surface-subtle'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selected_address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-brand-600 focus:ring-brand-500"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-2">
                            <strong className="font-bold text-charcoal text-sm">{addr.full_name}</strong>
                            <span className="text-charcoal-muted font-medium">({addr.phone_number})</span>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-charcoal mt-1">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                          </p>
                          <p className="text-charcoal-muted">
                            {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                          {addr.delivery_instructions && (
                            <p className="text-brand-800 text-[11px] mt-1 italic">
                              Instructions: {addr.delivery_instructions}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              ) : (
                /* Inline Add Address Form */
                <form onSubmit={handleAddressSubmit(onAddAddress)} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Full Name *
                      </label>
                      <input
                        {...registerAddress('full_name')}
                        placeholder="Recipient full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                      />
                      {addressErrors.full_name && (
                        <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.full_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Phone Number *
                      </label>
                      <input
                        {...registerAddress('phone_number')}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                      />
                      {addressErrors.phone_number && (
                        <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.phone_number.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Flat / House No. / Building / Street *
                    </label>
                    <input
                      {...registerAddress('address_line1')}
                      placeholder="e.g. Flat 302, Green Heights, 5th Cross"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                    />
                    {addressErrors.address_line1 && (
                      <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.address_line1.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        City *
                      </label>
                      <input
                        {...registerAddress('city')}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                      />
                      {addressErrors.city && (
                        <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        State *
                      </label>
                      <input
                        {...registerAddress('state')}
                        placeholder="e.g. Karnataka"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                      />
                      {addressErrors.state && (
                        <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Pincode *
                      </label>
                      <input
                        {...registerAddress('postal_code')}
                        placeholder="e.g. 560038"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                      />
                      {addressErrors.postal_code && (
                        <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.postal_code.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      {...registerAddress('delivery_instructions')}
                      placeholder="e.g. Leave with building security guard"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAddress}
                      className="btn-primary text-xs py-2 px-5"
                    >
                      {isSubmittingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Delivery Slot */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-surface-border">
                <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" /> Choose Delivery Window
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {deliverySlots.map((slot) => (
                  <label
                    key={slot.id}
                    className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedSlotId === slot.id
                        ? 'bg-brand-50/60 border-brand-500 ring-2 ring-brand-100 shadow-soft'
                        : 'border-surface-border hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal">{slot.name}</span>
                      <input
                        type="radio"
                        name="delivery_slot"
                        checked={selectedSlotId === slot.id}
                        onChange={() => setSelectedSlotId(slot.id)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                    </div>
                    <span className="text-xs text-charcoal-muted mt-2 font-medium">
                      {slot.time_window}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-surface-border">
                <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-brand-600" /> Payment Option
                </h3>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className="flex items-start gap-3 p-4 rounded-2xl border border-brand-500 bg-brand-50/40 ring-2 ring-brand-100 cursor-pointer shadow-soft">
                  <input
                    type="radio"
                    name="payment_method"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-charcoal">Cash on Delivery (COD)</strong>
                      <span className="badge-category font-bold text-[10px]">Verified & Active</span>
                    </div>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Pay cash or UPI at your doorstep after inspecting your fresh produce. Zero prepayment risk.
                    </p>
                  </div>
                </label>

                {/* Online Payment (Disabled / Optional) */}
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-surface-border bg-surface-subtle opacity-60">
                  <input
                    type="radio"
                    name="payment_method"
                    disabled
                    className="mt-1 cursor-not-allowed"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-charcoal">Online Payment (UPI, Cards, NetBanking)</strong>
                      <span className="text-[10px] font-bold bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                        Configurable in Production
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Online payment gateway integration is currently in sandbox. Please use Cash on Delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary & Place Order Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card space-y-4">
              <h3 className="text-base font-bold text-charcoal pb-3 border-b border-surface-border">
                Order Review ({itemCount} items)
              </h3>

              {/* Items List Snapshot Preview */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[180px] font-medium text-charcoal">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-bold text-charcoal">
                      ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 pt-3 border-t border-surface-border text-xs sm:text-sm">
                <div className="flex justify-between text-charcoal-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-charcoal-muted">
                  <span>Delivery Fee</span>
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
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-surface-border flex justify-between text-base font-extrabold text-charcoal">
                  <span>Total Payable (COD)</span>
                  <span className="text-brand-700">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={() => createOrderMutation.mutate()}
                disabled={createOrderMutation.isPending || !selectedAddressId || !selectedSlotId}
                className="w-full btn-primary py-4 rounded-2xl text-sm font-bold shadow-soft flex items-center justify-center gap-2 mt-4"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order (Pay ₹{total.toFixed(2)} on Delivery)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-charcoal-muted text-center pt-1">
                By placing this order you agree to FreshGrocer's doorstep inspection & delivery terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
