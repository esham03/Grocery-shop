import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, ShieldCheck, Clock, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-white/90 pt-16 pb-12 mt-auto border-t border-charcoal-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Next-Day Delivery</h4>
              <p className="text-xs text-white/60 mt-0.5">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Quality Checked</h4>
              <p className="text-xs text-white/60 mt-0.5">Farm fresh or your money back</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Flexible Time Slots</h4>
              <p className="text-xs text-white/60 mt-0.5">Morning, afternoon & evening</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cash on Delivery</h4>
              <p className="text-xs text-white/60 mt-0.5">Pay upon safe inspection</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">
                Fresh<span className="text-brand-400">Grocer</span>
              </span>
            </Link>
            <p className="text-xs text-white/60 max-w-sm leading-relaxed">
              FreshGrocer brings handpicked organic produce, daily essentials, and farm-fresh dairy straight from local growers to your kitchen.
            </p>
            <div className="text-xs text-white/60">
              <strong className="text-white block font-semibold mb-1">Customer Care:</strong>
              support@freshgrocer.com | +91 1800 200 4567
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><Link to="/shop?category=fruits" className="hover:text-white transition-colors">Fruits</Link></li>
              <li><Link to="/shop?category=vegetables" className="hover:text-white transition-colors">Vegetables</Link></li>
              <li><Link to="/shop?category=dairy-eggs" className="hover:text-white transition-colors">Dairy & Eggs</Link></li>
              <li><Link to="/shop?category=bakery" className="hover:text-white transition-colors">Bakery</Link></li>
              <li><Link to="/shop?category=grains" className="hover:text-white transition-colors">Grains & Pulses</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?offers=true" className="hover:text-white transition-colors">Discount Offers</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Saved Addresses</Link></li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Policies</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li><span className="hover:text-white cursor-pointer transition-colors">Delivery Terms</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Refund & Return Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2026 FreshGrocer Technologies Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for fresher, healthier living.
          </p>
        </div>
      </div>
    </footer>
  );
};
