import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User as UserIcon, MapPin, Plus, Trash2, CheckCircle2, Phone, Mail, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
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

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateProfile, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileName, setProfileName] = useState<string>(user ? `${user.first_name} ${user.last_name}`.trim() : '');
  const [profilePhone, setProfilePhone] = useState<string>(user?.phone_number || '');

  // Fetch Addresses
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.getAddresses(),
    enabled: isAuthenticated,
  });

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors, isSubmitting: isSubmittingAddress },
    reset: resetAddressForm,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) => api.createAddress(data as unknown as Omit<Address, 'id'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast('Address added successfully!', 'success');
      setIsAddingAddress(false);
      resetAddressForm();
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Could not add address', 'error');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => api.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast('Address removed.', 'info');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => api.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast('Default address updated.', 'success');
    },
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = profileName.trim().split(' ');
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ') || '';
    try {
      await updateProfile({ first_name, last_name, phone_number: profilePhone });
      setIsEditingProfile(false);
    } catch {
      // Error handled in context
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="py-20 bg-surface min-h-[70vh] flex items-center justify-center text-center">
        <div className="max-w-md p-8 bg-white rounded-3xl border border-surface-border shadow-soft space-y-4">
          <UserIcon className="w-12 h-12 text-brand-600 mx-auto" />
          <h2 className="text-xl font-bold text-charcoal">Sign In to View Profile</h2>
          <p className="text-xs text-charcoal-muted">
            Please log in with your FreshGrocer account to access your account profile and saved address book.
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
            My Account & Settings
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Manage your personal profile, contact information, and saved delivery addresses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* User Profile Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-surface-border">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center text-2xl font-black">
                {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-charcoal">
                  {user.first_name} {user.last_name}
                </h2>
                <span className="text-xs text-charcoal-muted block">@{user.username}</span>
                {user.is_staff && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full mt-1">
                    <ShieldCheck className="w-3 h-3" /> Staff Administrator
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info Details */}
            {!isEditingProfile ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 text-charcoal">
                  <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-charcoal">
                  <Phone className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{user.phone_number || 'No mobile number added'}</span>
                </div>

                <div className="pt-4 border-t border-surface-border">
                  <button
                    onClick={() => {
                      setProfileName(`${user.first_name} ${user.last_name}`.trim());
                      setProfilePhone(user.phone_number || '');
                      setIsEditingProfile(true);
                    }}
                    className="btn-secondary w-full text-xs py-2"
                  >
                    Edit Profile Details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="btn-secondary flex-1 text-xs py-2"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 text-xs py-2">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Saved Addresses Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <div>
                <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" /> Saved Delivery Addresses
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  {addresses.length} addresses registered
                </p>
              </div>

              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="btn-primary text-xs py-2 px-3.5 rounded-xl shadow-soft"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              )}
            </div>

            {/* Address List */}
            {!isAddingAddress ? (
              isLoadingAddresses ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-surface-subtle rounded-2xl" />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-xs text-charcoal-muted">
                  No delivery address saved yet. Click "Add Address" above to add your first delivery destination.
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        addr.is_default
                          ? 'bg-brand-50/40 border-brand-300 ring-1 ring-brand-200'
                          : 'border-surface-border bg-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-charcoal">{addr.full_name}</strong>
                            <span className="text-charcoal-muted font-medium">({addr.phone_number})</span>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-brand-600" /> Default
                              </span>
                            )}
                          </div>
                          <p className="text-charcoal">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                          </p>
                          <p className="text-charcoal-muted">
                            {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                          {addr.delivery_instructions && (
                            <p className="text-brand-800 italic text-[11px] pt-1">
                              Instructions: {addr.delivery_instructions}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!addr.is_default && (
                            <button
                              onClick={() => setDefaultMutation.mutate(addr.id)}
                              className="text-[11px] font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => deleteAddressMutation.mutate(addr.id)}
                            aria-label="Delete address"
                            className="p-1.5 rounded-lg text-charcoal-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Add Address Form */
              <form onSubmit={handleAddressSubmit((data) => addAddressMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Full Name *
                    </label>
                    <input
                      {...registerAddress('full_name')}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
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
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                    />
                    {addressErrors.phone_number && (
                      <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.phone_number.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    {...registerAddress('address_line1')}
                    placeholder="House / Flat / Street details"
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                  />
                  {addressErrors.address_line1 && (
                    <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.address_line1.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">City *</label>
                    <input
                      {...registerAddress('city')}
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                    />
                    {addressErrors.city && (
                      <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">State *</label>
                    <input
                      {...registerAddress('state')}
                      placeholder="State"
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                    />
                    {addressErrors.state && (
                      <p className="text-rose-600 text-[11px] mt-0.5">{addressErrors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Pincode *</label>
                    <input
                      {...registerAddress('postal_code')}
                      placeholder="560038"
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
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
                    placeholder="e.g. Ring bell twice, leave with security"
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
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
        </div>
      </div>
    </div>
  );
};
