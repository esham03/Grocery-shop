import {
  User,
  Address,
  Category,
  Product,
  Cart,
  Coupon,
  DeliverySlot,
  Order,
  AuthResponse,
  PaginatedResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

class ApiService {
  private getTokens(): { access: string | null; refresh: string | null } {
    return {
      access: localStorage.getItem('freshgrocer_access_token'),
      refresh: localStorage.getItem('freshgrocer_refresh_token'),
    };
  }

  public setTokens(access: string, refresh: string) {
    localStorage.setItem('freshgrocer_access_token', access);
    localStorage.setItem('freshgrocer_refresh_token', refresh);
  }

  public clearTokens() {
    localStorage.removeItem('freshgrocer_access_token');
    localStorage.removeItem('freshgrocer_refresh_token');
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('freshgrocer_access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (networkError) {
      throw new Error('Unable to connect to FreshGrocer backend server. Please verify the server is running.');
    }

    // Handle token expiration & automatic refresh
    if (response.status === 401 && this.getTokens().refresh) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null) {
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            const firstKey = Object.keys(errorData)[0];
            const val = errorData[firstKey];
            errorMessage = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val);
          }
        }
      } catch {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    const refresh = this.getTokens().refresh;
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access) {
          localStorage.setItem('freshgrocer_access_token', data.access);
          return true;
        }
      }
    } catch {
      // Refresh failed
    }

    this.clearTokens();
    return false;
  }

  // Auth Endpoints
  public async register(payload: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async login(payload: { username: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile/');
  }

  public async updateProfile(payload: Partial<User>): Promise<User> {
    return this.request<User>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Categories
  public async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories/');
  }

  // Products
  public async getProducts(params?: {
    category?: string | number;
    search?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    ordering?: string;
    page?: number;
    page_size?: number;
    featured?: boolean;
    bestseller?: boolean;
  }): Promise<PaginatedResponse<Product>> {
    const query = new URLSearchParams();
    if (params) {
      if (params.category) query.append('category', String(params.category));
      if (params.search) query.append('search', params.search);
      if (params.min_price !== undefined) query.append('min_price', String(params.min_price));
      if (params.max_price !== undefined) query.append('max_price', String(params.max_price));
      if (params.in_stock !== undefined) query.append('in_stock', String(params.in_stock));
      if (params.ordering) query.append('ordering', params.ordering);
      if (params.page) query.append('page', String(params.page));
      if (params.page_size) query.append('page_size', String(params.page_size));
      if (params.featured) query.append('is_featured', 'true');
      if (params.bestseller) query.append('is_bestseller', 'true');
    }
    const qStr = query.toString();
    return this.request<PaginatedResponse<Product>>(`/products/${qStr ? `?${qStr}` : ''}`);
  }

  public async getProductBySlug(slug: string): Promise<Product> {
    return this.request<Product>(`/products/${slug}/`);
  }

  // Addresses
  public async getAddresses(): Promise<Address[]> {
    return this.request<Address[]>('/addresses/');
  }

  public async createAddress(address: Omit<Address, 'id'>): Promise<Address> {
    return this.request<Address>('/addresses/', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  public async updateAddress(id: number, address: Partial<Address>): Promise<Address> {
    return this.request<Address>(`/addresses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(address),
    });
  }

  public async deleteAddress(id: number): Promise<void> {
    return this.request<void>(`/addresses/${id}/`, {
      method: 'DELETE',
    });
  }

  public async setDefaultAddress(id: number): Promise<Address> {
    return this.request<Address>(`/addresses/${id}/set_default/`, {
      method: 'POST',
    });
  }

  // Cart (Backend synchronization)
  public async getCart(): Promise<Cart> {
    return this.request<Cart>('/cart/');
  }

  public async addToCart(productId: number, quantity: number = 1): Promise<Cart> {
    return this.request<Cart>('/cart/items/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  public async updateCartItem(productId: number, quantity: number): Promise<Cart> {
    return this.request<Cart>(`/cart/items/${productId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  public async removeCartItem(productId: number): Promise<Cart> {
    return this.request<Cart>(`/cart/items/${productId}/`, {
      method: 'DELETE',
    });
  }

  public async clearCart(): Promise<Cart> {
    return this.request<Cart>('/cart/clear/', {
      method: 'POST',
    });
  }

  public async mergeGuestCart(items: { product_id: number; quantity: number }[]): Promise<Cart> {
    return this.request<Cart>('/cart/merge/', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Coupons
  public async validateCoupon(code: string, orderAmount: number): Promise<{
    valid: boolean;
    coupon: Coupon;
    discount_amount: number;
    message: string;
  }> {
    return this.request('/coupons/validate/', {
      method: 'POST',
      body: JSON.stringify({ code, order_amount: orderAmount }),
    });
  }

  // Delivery Slots
  public async getDeliverySlots(): Promise<DeliverySlot[]> {
    return this.request<DeliverySlot[]>('/delivery-slots/');
  }

  // Orders
  public async createOrder(payload: {
    address_id: number;
    delivery_slot_id: number;
    payment_method: 'COD' | 'ONLINE';
    coupon_code?: string;
    delivery_instructions?: string;
  }): Promise<Order> {
    return this.request<Order>('/orders/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getMyOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders/');
  }

  public async getOrderById(id: number | string): Promise<Order> {
    return this.request<Order>(`/orders/${id}/`);
  }

  public async cancelOrder(id: number | string, reason: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

export const api = new ApiService();
