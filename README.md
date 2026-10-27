# FreshGrocer 🛒🌿
> **Fresh groceries. Delivered with care.**

FreshGrocer is a complete, modern, production-grade full-stack grocery e-commerce web application. Built with a responsive React 18 & TypeScript frontend and a secure Python Django REST Framework backend with atomic transaction processing, JWT authentication, inventory controls, and configurable INR (₹) pricing.

---

## 🌟 Highlights & Features

- **🛍️ Complete Grocery Shopping Experience**:
  - **Landing Page**: Modern hero section, 8 grocery aisles (Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks, Grains, Household Essentials), featured produce, promotional banners, why choose us trust badges, testimonials, and validated newsletter subscription.
  - **Shop Catalog**: Full-text product search, category filtering, price sliders, in-stock only filters, and multi-criteria sorting (price, popularity, rating, alphabetical).
  - **Product Details**: High-resolution imagery with graceful error fallbacks, unit specifications (e.g. `1 kg`, `500 g`, `6 pcs`), discount percentage computation, dynamic stock ceilings, and related product recommendations.
  - **Interactive Cart**: Live badge counter, slide-over drawer preview, full cart page, itemized calculations, Free Delivery tracker (orders &gt; ₹499), and coupon validation (`FRESH50`, `WELCOME100`).
  - **Dual Persistence**: Guest cart automatically stored in `localStorage` and merged seamlessly into user's database cart upon login.
  - **Streamlined Checkout**: Address selection / inline address creation with Zod validation, delivery slot scheduling (Morning, Afternoon, Evening), and Cash on Delivery (COD) as primary payment.
  - **Order Tracking & Management**: Real-time status pipeline (`Pending`, `Confirmed`, `Processing`, `Out for Delivery`, `Delivered`, `Cancelled`). Historical order price snapshots ensure invoices remain accurate even when catalog prices fluctuate.
  - **Doorstep Cancellation**: Cancel orders with restock rollback in `Pending` or `Confirmed` status.
  - **Django Admin Interface**: Full management of products, inventory alerts, orders, delivery slots, and coupons with custom list filters and stock badges.

- **🛡️ Preserved Legacy Code**:
  - The original static HTML/CSS/JS files are archived safely in [`legacy/`](file:///c:/Grocery-shop/legacy) (`index.html`, `script.js`, `style.css`), preserving the original 4 products (Fresh Apples, Bananas, Carrots, Tomatoes) and asset references.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query v5, React Hook Form, Zod, Lucide React |
| **Backend** | Python 3.12, Django 6, Django REST Framework, SimpleJWT (JSON Web Tokens), django-cors-headers, django-filter |
| **Database** | PostgreSQL (Production) / SQLite `db.sqlite3` (Local Development fallback) with Decimal fields |
| **Testing** | Pytest + Pytest-Django (Backend), Vitest + React Testing Library + JSDOM (Frontend) |

---

## 📁 Project Structure

```text
Grocery-shop/
├── backend/                       # Django Backend
│   ├── freshgrocer_backend/       # Project configuration (settings, root URLs)
│   ├── accounts/                  # User accounts, profiles, saved addresses, JWT auth
│   ├── products/                  # Category, Product models, inventory, seed command
│   ├── cart/                      # Cart, CartItem models, guest cart merge endpoints
│   ├── orders/                    # Order, OrderItem snapshots, Coupons, Delivery Slots
│   ├── tests/                     # Automated pytest test suite
│   ├── manage.py                  # Django management CLI
│   └── requirements.txt           # Python dependency specifications
├── frontend/                      # React Frontend
│   ├── src/
│   │   ├── components/            # Reusable UI components (Navbar, Footer, CartDrawer, etc.)
│   │   ├── context/               # AuthContext, CartContext, ToastContext
│   │   ├── pages/                 # HomePage, ShopPage, ProductDetailPage, CartPage, CheckoutPage, etc.
│   │   ├── services/              # REST API client wrapper with JWT interceptors
│   │   ├── test/                  # Vitest & React Testing Library test suite
│   │   └── types/                 # TypeScript interfaces and domain models
│   ├── index.html                 # HTML5 template
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tailwind.config.js         # Design system tokens and curated color palette
│   └── vite.config.ts             # Vite configuration with dev proxy & Vitest setup
├── docs/                          # Setup guides and REST API documentation
├── legacy/                        # Preserved original HTML/CSS/JS files
├── .env.example                   # Environment configuration template
├── .gitignore                     # Repository git ignore rules
└── README.md                      # Project documentation
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** v18+ & **npm** v9+ (v24.19 recommended)
- **Python** 3.10+ (Python 3.12 recommended)
- **Git**

---

### Step 1: Environment Setup

Create your `.env` file from the provided template:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

---

### Step 2: Backend Setup & Database Seeding

1. **Activate the Python virtual environment**:

   **Windows PowerShell:**
   ```powershell
   .\backend\venv\Scripts\Activate.ps1
   ```

   **macOS / Linux:**
   ```bash
   source backend/venv/bin/activate
   ```

2. **Install backend dependencies** (if not already installed):
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Apply database migrations**:
   ```bash
   python backend/manage.py migrate
   ```

4. **Seed sample grocery catalog, users, slots, and coupons**:
   ```bash
   python backend/manage.py seed_catalog
   ```

5. **Start Django API server**:
   ```bash
   python backend/manage.py runserver 127.0.0.1:8000
   ```
   *The API will be live at `http://127.0.0.1:8000/api/v1/` and Django Admin at `http://127.0.0.1:8000/admin/`.*

---

### Step 3: Frontend Setup

Open a new terminal window:

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   *The application will open at `http://127.0.0.1:5173/`.*

---

## 🧪 Running Automated Tests

### 1. Backend Test Suite (Pytest)
Runs 9 comprehensive unit & integration tests covering authentication, search, cart stock validation, atomic order creation, and cancellation inventory rollback:

```powershell
# From project root
.\backend\venv\Scripts\pytest backend\tests
```

### 2. Frontend Test Suite (Vitest)
Runs Vitest and React Testing Library tests verifying ProductCard rendering, INR formatting, CartContext calculations, and delivery fees:

```powershell
# From frontend directory
cd frontend
npm test
```

### 3. Frontend Production Build Check
Verifies TypeScript compilation and bundle generation:

```powershell
cd frontend
npm run build
```

---

## 🔑 Default Credentials

The `seed_catalog` command automatically creates demo and administrator accounts:

| Role | Username | Password | Email | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Customer** | `demouser` | `demo123` | `demo@example.com` | Pre-configured with saved Indiranagar, Bengaluru address |
| **Administrator** | `admin` | `admin123` | `admin@freshgrocer.com` | Access Django Admin dashboard at `/admin/` |

> *Tip: On the checkout and sign-in pages, you can click **"Quick Login as Demo Customer (Priya Sharma)"** for instant one-click authentication.*

---

## 🎟️ Active Promotional Coupons

| Coupon Code | Discount | Minimum Order | Description |
| :--- | :--- | :--- | :--- |
| **`FRESH50`** | ₹50 FLAT OFF | ₹299.00 | Weekend Grocery Special |
| **`WELCOME100`** | ₹100 FLAT OFF | ₹499.00 | First-time shopper welcome discount + Free Delivery |
| **`ORGANIC15`** | 15% OFF (up to ₹150) | ₹699.00 | Healthy Organic Harvests special |

---

## 📡 REST API Summary

Full documentation is available in [`docs/api.md`](file:///c:/Grocery-shop/docs/api.md).

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register/` | Register new customer account | No |
| `POST` | `/api/v1/auth/login/` | Obtain JWT tokens and profile | No |
| `GET` | `/api/v1/auth/profile/` | Current user profile | Yes (JWT) |
| `GET` | `/api/v1/categories/` | List all 8 grocery aisles with item counts | No |
| `GET` | `/api/v1/products/` | Filterable, searchable, and sorted catalog | No |
| `GET` | `/api/v1/products/{slug}/` | Product detail by slug | No |
| `GET/POST` | `/api/v1/cart/items/` | Add or retrieve user cart items | Yes (JWT) |
| `POST` | `/api/v1/cart/merge/` | Merge guest cart items into user cart | Yes (JWT) |
| `POST` | `/api/v1/coupons/validate/` | Validate coupon code against subtotal | No |
| `GET` | `/api/v1/delivery-slots/` | List active delivery windows | No |
| `POST` | `/api/v1/orders/` | Place order with atomic stock decrement | Yes (JWT) |
| `GET` | `/api/v1/orders/` | Customer order history | Yes (JWT) |
| `POST` | `/api/v1/orders/{id}/cancel/` | Cancel pending/confirmed order with restock | Yes (JWT) |

---

## 🔧 Troubleshooting

- **Port in use**: If port 8000 is occupied, run `python backend/manage.py runserver 127.0.0.1:8001` and update `VITE_API_BASE` in your `.env`.
- **Database resets**: To reset the database cleanly, delete `backend/db.sqlite3` and run `python backend/manage.py migrate` followed by `python backend/manage.py seed_catalog`.
- **PostgreSQL Connection**: To switch from local SQLite to PostgreSQL, configure `DATABASE_URL=postgresql://user:password@localhost:5432/freshgrocer_db` in `.env` and run migrations.