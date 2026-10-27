export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_staff?: boolean;
}

export interface Address {
  id: number;
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  delivery_instructions?: string;
  is_default: boolean;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image: string;
  icon_name?: string;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: number | Category;
  category_name?: string;
  description: string;
  price: number; // Selling price in INR
  original_price?: number | null; // MSRP
  unit: string; // e.g. "1 kg", "500 g", "6 pcs"
  stock_quantity: number;
  min_stock_level: number;
  image_url: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  is_in_stock: boolean;
  discount_percentage?: number;
}

export interface CartItem {
  id?: number;
  product_id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id?: number;
  items: CartItem[];
  subtotal: number;
  total_items: number;
}

export interface Coupon {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  description?: string;
}

export interface DeliverySlot {
  id: number;
  name: string;
  time_window: string;
  is_active: boolean;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemSnapshot {
  id: number;
  product_name: string;
  product_unit: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string;
  payment_method: 'COD' | 'ONLINE';
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED';
  delivery_slot_name: string;
  delivery_slot_window: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  delivery_instructions?: string;
  cancellation_reason?: string;
  can_cancel: boolean;
  created_at: string;
  items: OrderItemSnapshot[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
