import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  MapPin,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  ShieldCheck,
  Tag,
  Store,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const LOCATIONS = [
  'Indiranagar, Bengaluru (560038)',
  'Koramangala, Bengaluru (560034)',
  'Bandra West, Mumbai (400050)',
  'Connaught Place, New Delhi (110001)',
  'Gachibowli, Hyderabad (500032)',
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { itemCount, openCart } = useCart();

  const [selectedLocation, setSelectedLocation] = useState<string>(LOCATIONS[0]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-border">
      {/* Top Banner */}
      <div className="bg-brand-900 text-brand-100 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-accent-400" />
        <span>
          Use code <strong className="text-white underline">WELCOME100</strong> for ₹100 OFF your first order! Free delivery over ₹499.
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 group-hover:bg-brand-700 flex items-center justify-center text-white shadow-soft transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-charcoal flex items-center">
                  Fresh<span className="text-brand-600">Grocer</span>
                </span>
                <span className="hidden sm:block text-[10px] text-charcoal-muted tracking-wide -mt-1 font-medium">
                  Fresh groceries. Delivered with care.
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector */}
            <div className="hidden lg:relative lg:block">
              <button
                onClick={() => setIsLocationDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-surface-subtle hover:bg-stone-200/70 border border-surface-border text-xs text-charcoal font-medium transition-colors"
                aria-expanded={isLocationDropdownOpen}
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span className="max-w-[150px] truncate">{selectedLocation}</span>
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted" />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-lift border border-surface-border p-2 z-50">
                  <p className="text-[11px] font-semibold text-charcoal-muted px-2 py-1">
                    Select delivery destination:
                  </p>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors ${
                        selectedLocation === loc
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'hover:bg-surface-subtle text-charcoal'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for apples, milk, bread, organic vegetables..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-subtle hover:bg-stone-100 focus:bg-white rounded-2xl border border-surface-border text-xs sm:text-sm text-charcoal placeholder-charcoal-muted focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
            />
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3.5" />
          </form>

          {/* Navigation Links and Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Nav Links Desktop */}
            <nav className="hidden xl:flex items-center gap-1 text-sm font-semibold text-charcoal">
              <Link to="/" className="px-3 py-2 rounded-xl hover:text-brand-700 hover:bg-surface-subtle transition-colors">
                Home
              </Link>
              <Link to="/shop" className="px-3 py-2 rounded-xl hover:text-brand-700 hover:bg-surface-subtle transition-colors">
                Shop
              </Link>
              <Link to="/shop?offers=true" className="px-3 py-2 rounded-xl text-accent-700 hover:bg-accent-50 transition-colors flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Offers
              </Link>
              {isAuthenticated && (
                <Link to="/orders" className="px-3 py-2 rounded-xl hover:text-brand-700 hover:bg-surface-subtle transition-colors">
                  My Orders
                </Link>
              )}
            </nav>

            {/* User Account Menu / Login */}
            <div className="relative">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-surface-subtle hover:bg-stone-200/60 border border-surface-border transition-colors text-xs font-semibold text-charcoal"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                      {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">Hi, {user.first_name || user.username}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted hidden sm:inline" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lift border border-surface-border p-2 z-50">
                      <div className="px-3 py-2 border-b border-surface-border mb-1">
                        <p className="text-xs font-bold text-charcoal">{user.first_name} {user.last_name}</p>
                        <p className="text-[11px] text-charcoal-muted truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-charcoal hover:bg-surface-subtle rounded-xl transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-charcoal-muted" /> My Account & Addresses
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-charcoal hover:bg-surface-subtle rounded-xl transition-colors"
                      >
                        <Package className="w-4 h-4 text-charcoal-muted" /> Order History
                      </Link>

                      {user.is_staff && (
                        <a
                          href="http://localhost:8000/admin/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-brand-600" /> Django Admin
                        </a>
                      )}

                      <div className="border-t border-surface-border mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-xl"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Cart Icon & Live Counter */}
            <button
              onClick={openCart}
              aria-label={`View cart with ${itemCount} items`}
              className="btn-primary relative text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-xl shadow-soft"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="w-5 h-5 rounded-full bg-white text-brand-800 text-[11px] font-bold flex items-center justify-center ml-0.5">
                {itemCount}
              </span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="xl:hidden p-2 text-charcoal hover:bg-surface-subtle rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries..."
              className="w-full pl-9 pr-4 py-2 bg-surface-subtle rounded-xl border border-surface-border text-xs text-charcoal placeholder-charcoal-muted focus:outline-hidden focus:border-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-surface-border bg-white px-4 py-4 space-y-2 shadow-card">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-charcoal hover:bg-surface-subtle"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-charcoal hover:bg-surface-subtle"
          >
            <Store className="w-4 h-4 text-brand-600" /> Shop Catalog
          </Link>
          <Link
            to="/shop?offers=true"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-accent-700 hover:bg-accent-50"
          >
            <Tag className="w-4 h-4 text-accent-600" /> Special Offers & Coupons
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-charcoal hover:bg-surface-subtle"
              >
                <Package className="w-4 h-4 text-charcoal-muted" /> My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-charcoal hover:bg-surface-subtle"
              >
                <UserIcon className="w-4 h-4 text-charcoal-muted" /> My Profile & Addresses
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
