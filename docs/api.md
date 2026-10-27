# FreshGrocer REST API Documentation (v1)

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication Endpoints

### Register User
- **POST** `/auth/register/`
- **Payload**:
  ```json
  {
    "username": "anita_d",
    "email": "anita@example.com",
    "password": "Password123!",
    "first_name": "Anita",
    "last_name": "Desai",
    "phone_number": "+91 98765 43210"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "user": {
      "id": 3,
      "username": "anita_d",
      "email": "anita@example.com",
      "first_name": "Anita",
      "last_name": "Desai",
      "phone_number": "+91 98765 43210"
    },
    "tokens": {
      "access": "eyJhbGci...",
      "refresh": "eyJhbGci..."
    }
  }
  ```

### Login
- **POST** `/auth/login/`
- **Payload**:
  ```json
  {
    "username": "demouser",
    "password": "demo123"
  }
  ```
- **Response** (200 OK): Returns JWT `access` and `refresh` tokens plus user profile.

### Refresh Token
- **POST** `/auth/token/refresh/`
- **Payload**:
  ```json
  {
    "refresh": "<refresh_token>"
  }
  ```

### User Profile
- **GET** `/auth/profile/` (Authenticated)
- **PATCH** `/auth/profile/` (Authenticated)

---

## 2. Addresses Endpoints (Authenticated)

- **GET** `/addresses/` - List user's saved delivery addresses
- **POST** `/addresses/` - Add a new delivery address
- **PATCH** `/addresses/{id}/` - Update delivery address
- **DELETE** `/addresses/{id}/` - Delete delivery address
- **POST** `/addresses/{id}/set_default/` - Set address as default

---

## 3. Product Catalog Endpoints (Public)

### Categories
- **GET** `/categories/` - Returns all 8 active categories with item counts

### Products
- **GET** `/products/` - Filterable, searchable, and paginated product list
  - **Query Parameters**:
    - `search`: Keyword search in name and description
    - `category`: Category slug (e.g. `fruits`, `vegetables`)
    - `min_price` & `max_price`: Numeric price range
    - `in_stock`: `true` to filter out-of-stock items
    - `ordering`: `price`, `-price`, `-rating`, `name`
    - `page`: Page number (default: 1)
- **GET** `/products/{slug}/` - Single product details by slug (e.g., `/products/fresh-apples/`)

---

## 4. Shopping Cart Endpoints (Authenticated)

- **GET** `/cart/` - Retrieve authenticated user's cart
- **POST** `/cart/items/` - Add item to cart with inventory check
  ```json
  { "product_id": 1, "quantity": 2 }
  ```
- **PATCH** `/cart/items/{product_id}/` - Update item quantity
- **DELETE** `/cart/items/{product_id}/` - Remove item from cart
- **POST** `/cart/clear/` - Clear all items
- **POST** `/cart/merge/` - Merge guest items after login

---

## 5. Coupons & Delivery Slots

### Delivery Slots
- **GET** `/delivery-slots/` - List available time windows (Morning, Afternoon, Evening)

### Validate Coupon
- **POST** `/coupons/validate/`
  ```json
  { "code": "FRESH50", "order_amount": 350.00 }
  ```

---

## 6. Checkout & Orders (Authenticated)

### Create Order (Atomic Checkout)
- **POST** `/orders/`
  ```json
  {
    "address_id": 1,
    "delivery_slot_id": 1,
    "payment_method": "COD",
    "coupon_code": "FRESH50",
    "delivery_instructions": "Leave near front door"
  }
  ```
- **Response** (201 Created):
  - Automatically verifies stock, decrements inventory atomically, creates immutable item snapshot records, and clears the cart.

### Order History
- **GET** `/orders/` - List authenticated user's orders
- **GET** `/orders/{id}/` - Order details with historical snapshot pricing
- **POST** `/orders/{id}/cancel/` - Cancel order (only allowed if status is `PENDING` or `CONFIRMED`); automatically restores reserved stock.
