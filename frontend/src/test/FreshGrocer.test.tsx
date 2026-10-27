import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';

const mockProduct: Product = {
  id: 1,
  name: 'Fresh Apples',
  slug: 'fresh-apples',
  category: 1,
  category_name: 'Fruits',
  description: 'Crisp Royal Gala apples',
  price: 149.00,
  original_price: 189.00,
  unit: '1 kg',
  stock_quantity: 50,
  min_stock_level: 10,
  image_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2',
  rating: 4.8,
  review_count: 120,
  is_featured: true,
  is_bestseller: true,
  is_active: true,
  is_in_stock: true,
  discount_percentage: 21,
};

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>{ui}</BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('FreshGrocer Frontend Core Components', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('renders product card with INR pricing and discount badge', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    expect(screen.getByText('₹149.00')).toBeInTheDocument();
    expect(screen.getByText('₹189.00')).toBeInTheDocument();
    expect(screen.getByText('21% OFF')).toBeInTheDocument();
  });

  it('adds product to cart and updates interactive quantity controls', async () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const addButton = screen.getByRole('button', { name: /Add Fresh Apples to cart/i });
    expect(addButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(addButton);
    });

    // Stepper should now show with quantity 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('CartContext correctly tracks subtotal and remaining free delivery', async () => {
    const TestCartConsumer: React.FC = () => {
      const { items, subtotal, deliveryFee, addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart(mockProduct, 2)}>Add 2 Apples</button>
          <span data-testid="cart-items-count">{items.length}</span>
          <span data-testid="cart-subtotal">{subtotal}</span>
          <span data-testid="cart-delivery-fee">{deliveryFee}</span>
        </div>
      );
    };

    renderWithProviders(<TestCartConsumer />);

    const addBtn = screen.getByText('Add 2 Apples');
    await act(async () => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByTestId('cart-items-count').textContent).toBe('1');
    // 2 * 149 = 298
    expect(screen.getByTestId('cart-subtotal').textContent).toBe('298');
    // Below 499 threshold -> delivery fee 40
    expect(screen.getByTestId('cart-delivery-fee').textContent).toBe('40');
  });
});
