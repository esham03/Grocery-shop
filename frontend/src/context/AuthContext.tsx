import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const { showToast } = useToast();

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Sync on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await api.getProfile();
        setUser(profile);
      } catch {
        api.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = async (response: AuthResponse) => {
    api.setTokens(response.tokens.access, response.tokens.refresh);
    setUser(response.user);
    closeAuthModal();

    // Check if guest cart has items and sync them
    const guestCartStr = localStorage.getItem('freshgrocer_guest_cart');
    if (guestCartStr) {
      try {
        const guestItems = JSON.parse(guestCartStr);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          await api.mergeGuestCart(
            guestItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
          );
          localStorage.removeItem('freshgrocer_guest_cart');
          showToast('Guest cart merged successfully!', 'success');
        }
      } catch {
        // Continue if merge fails
      }
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const res = await api.login(credentials);
      await handleAuthSuccess(res);
      showToast(`Welcome back, ${res.user.first_name || res.user.username}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid username or password.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }) => {
    try {
      const res = await api.register(data);
      await handleAuthSuccess(res);
      showToast(`Account created! Welcome to FreshGrocer, ${res.user.first_name}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check inputs.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const logout = () => {
    api.clearTokens();
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updated = await api.updateProfile(data);
      setUser(updated);
      showToast('Profile updated successfully.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update profile.';
      showToast(msg, 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
