import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  freeDeliveryThreshold: number;
  remainingForFreeDelivery: number;
  appliedCoupon: Coupon | null;
  couponDiscountAmount: number;
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 40;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Save guest cart to localStorage
  const saveGuestCart = useCallback((cartItems: CartItem[]) => {
    localStorage.setItem(
      'freshgrocer_guest_cart',
      JSON.stringify(
        cartItems.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          product: i.product,
          subtotal: i.subtotal,
        }))
      )
    );
  }, []);

  // Fetch or load cart
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      if (isAuthenticated) {
        try {
          const backendCart = await api.getCart();
          setItems(backendCart.items || []);
        } catch {
          // If server fails or is offline, load from local storage
          const saved = localStorage.getItem('freshgrocer_guest_cart');
          if (saved) {
            try {
              setItems(JSON.parse(saved));
            } catch {
              setItems([]);
            }
          }
        }
      } else {
        const saved = localStorage.getItem('freshgrocer_guest_cart');
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch {
            setItems([]);
          }
        }
      }
      setIsLoading(false);
    };

    loadCart();
  }, [isAuthenticated]);

  // Calculations
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  }, [items]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  }, [subtotal]);

  const remainingForFreeDelivery = useMemo(() => {
    if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
    return FREE_DELIVERY_THRESHOLD - subtotal;
  }, [subtotal]);

  // Recalculate coupon discount if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < appliedCoupon.min_order_amount) {
        setAppliedCoupon(null);
        setCouponDiscountAmount(0);
      } else {
        if (appliedCoupon.discount_type === 'PERCENTAGE') {
          let disc = (subtotal * appliedCoupon.discount_value) / 100;
          if (appliedCoupon.max_discount_amount && disc > appliedCoupon.max_discount_amount) {
            disc = appliedCoupon.max_discount_amount;
          }
          setCouponDiscountAmount(Math.round(disc));
        } else {
          setCouponDiscountAmount(Math.min(appliedCoupon.discount_value, subtotal));
        }
      }
    }
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + deliveryFee - couponDiscountAmount);
  }, [subtotal, deliveryFee, couponDiscountAmount]);

  const getItemQuantity = useCallback(
    (productId: number): number => {
      const match = items.find((i) => i.product.id === productId);
      return match ? match.quantity : 0;
    },
    [items]
  );

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (product.stock_quantity < quantity) {
      showToast(`Sorry, only ${product.stock_quantity} in stock.`, 'warning');
      return;
    }

    if (isAuthenticated) {
      try {
        const backendCart = await api.addToCart(product.id, quantity);
        setItems(backendCart.items);
        showToast(`Added ${product.name} to your basket!`, 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not add product to cart.';
        showToast(msg, 'error');
      }
    } else {
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.product.id === product.id);
        let updated: CartItem[];
        if (existingIndex > -1) {
          const currentQty = prev[existingIndex].quantity;
          const newQty = Math.min(product.stock_quantity, currentQty + quantity);
          updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            subtotal: newQty * Number(product.price),
          };
        } else {
          updated = [
            ...prev,
            {
              product_id: product.id,
              product,
              quantity,
              subtotal: quantity * Number(product.price),
            },
          ];
        }
        saveGuestCart(updated);
        return updated;
      });
      showToast(`Added ${product.name} to basket!`, 'success');
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (isAuthenticated) {
      try {
        const backendCart = await api.updateCartItem(productId, quantity);
        setItems(backendCart.items);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not update quantity.';
        showToast(msg, 'error');
      }
    } else {
      setItems((prev) => {
        const updated = prev.map((item) => {
          if (item.product.id === productId) {
            const cappedQty = Math.min(item.product.stock_quantity, quantity);
            return {
              ...item,
              quantity: cappedQty,
              subtotal: cappedQty * Number(item.product.price),
            };
          }
          return item;
        });
        saveGuestCart(updated);
        return updated;
      });
    }
  };

  const removeFromCart = async (productId: number) => {
    if (isAuthenticated) {
      try {
        const backendCart = await api.removeCartItem(productId);
        setItems(backendCart.items);
        showToast('Item removed from basket.', 'info');
      } catch {
        showToast('Could not remove item.', 'error');
      }
    } else {
      setItems((prev) => {
        const updated = prev.filter((i) => i.product.id !== productId);
        saveGuestCart(updated);
        return updated;
      });
      showToast('Item removed from basket.', 'info');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.clearCart();
        setItems([]);
        showToast('Your basket has been cleared.', 'info');
      } catch {
        showToast('Could not clear cart.', 'error');
      }
    } else {
      setItems([]);
      localStorage.removeItem('freshgrocer_guest_cart');
      showToast('Your basket has been cleared.', 'info');
    }
    setAppliedCoupon(null);
    setCouponDiscountAmount(0);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      showToast('Please enter a coupon code.', 'warning');
      return false;
    }

    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        setCouponDiscountAmount(res.discount_amount);
        showToast(`Coupon applied! Saved ₹${res.discount_amount}`, 'success');
        return true;
      } else {
        showToast(res.message || 'Invalid coupon code.', 'error');
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Coupon could not be applied.';
      showToast(msg, 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountAmount(0);
    showToast('Coupon removed.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        discount: couponDiscountAmount,
        total,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        remainingForFreeDelivery,
        appliedCoupon,
        couponDiscountAmount,
        isCartOpen,
        isLoading,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
