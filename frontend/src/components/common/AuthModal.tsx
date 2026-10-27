import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Lock, Mail, User as UserIcon, Phone, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    setValue: setLoginValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  if (!isAuthModalOpen) return null;

  const onLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await login({ username: data.username, password: data.password });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
      });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoginValue('username', 'demouser');
    setLoginValue('password', 'demo123');
    setIsSubmitting(true);
    setFormError(null);
    try {
      await login({ username: 'demouser', password: 'demo123' });
    } catch {
      setFormError('Demo login failed. Make sure database is seeded.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-lift border border-surface-border relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeAuthModal}
          aria-label="Close dialog"
          className="absolute top-5 right-5 text-charcoal-muted hover:text-charcoal p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mb-3 shadow-soft">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal">
            {authModalTab === 'login' ? 'Welcome Back!' : 'Join FreshGrocer'}
          </h2>
          <p className="text-xs text-charcoal-muted mt-1">
            {authModalTab === 'login'
              ? 'Log in to track your orders and access saved addresses'
              : 'Create an account for quick checkout and exclusive discounts'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-surface-subtle p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              setFormError(null);
              openAuthModal('login');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-white text-charcoal shadow-soft'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setFormError(null);
              openAuthModal('register');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-white text-charcoal shadow-soft'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Create Account
          </button>
        </div>

        {formError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {formError}
          </div>
        )}

        {/* Sign In Form */}
        {authModalTab === 'login' ? (
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
                <input
                  {...registerLogin('username')}
                  type="text"
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              {loginErrors.username && (
                <p className="text-rose-600 text-[11px] mt-1">{loginErrors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
                <input
                  {...registerLogin('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              {loginErrors.password && (
                <p className="text-rose-600 text-[11px] mt-1">{loginErrors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 rounded-xl text-sm font-semibold mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                'Sign In to FreshGrocer'
              )}
            </button>

            {/* Quick Demo Login */}
            <div className="pt-2 border-t border-surface-border">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Quick Login as Demo Customer (Priya Sharma)
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  First Name
                </label>
                <input
                  {...registerRegister('first_name')}
                  placeholder="Anita"
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
                {registerErrors.first_name && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{registerErrors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Last Name
                </label>
                <input
                  {...registerRegister('last_name')}
                  placeholder="Desai"
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
                {registerErrors.last_name && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{registerErrors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
                <input
                  {...registerRegister('username')}
                  placeholder="anita_d"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-sm focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              {registerErrors.username && (
                <p className="text-rose-600 text-[11px] mt-0.5">{registerErrors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
                <input
                  {...registerRegister('email')}
                  type="email"
                  placeholder="anita@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-sm focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              {registerErrors.email && (
                <p className="text-rose-600 text-[11px] mt-0.5">{registerErrors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
                <input
                  {...registerRegister('phone_number')}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-sm focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              {registerErrors.phone_number && (
                <p className="text-rose-600 text-[11px] mt-0.5">{registerErrors.phone_number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
                <input
                  {...registerRegister('password')}
                  type="password"
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-sm focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              {registerErrors.password && (
                <p className="text-rose-600 text-[11px] mt-0.5">{registerErrors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 rounded-xl text-sm font-semibold mt-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                'Create FreshGrocer Account'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
