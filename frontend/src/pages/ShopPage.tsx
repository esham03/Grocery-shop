import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, ShoppingBag, ArrowUpDown, Tag } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

const SORT_OPTIONS = [
  { label: 'Featured Produce', value: '-is_featured,-created_at' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Customer Rating', value: '-rating' },
  { label: 'Alphabetical (A-Z)', value: 'name' },
];

const PRICE_RANGES = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100 to ₹250', min: 100, max: 250 },
  { label: 'Above ₹250', min: 250, max: undefined },
];

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlOffers = searchParams.get('offers') === 'true';

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchInput, setSearchInput] = useState<string>(urlSearch);
  const [appliedSearch, setAppliedSearch] = useState<string>(urlSearch);
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>(SORT_OPTIONS[0].value);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Sync state if URL searchParams change
  useEffect(() => {
    setSelectedCategory(urlCategory);
    setSearchInput(urlSearch);
    setAppliedSearch(urlSearch);
    setCurrentPage(1);
  }, [urlCategory, urlSearch]);

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  // Price range parameters
  const activePriceRange = PRICE_RANGES[selectedPriceRangeIndex];

  // Fetch Products
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      'shop-products',
      selectedCategory,
      appliedSearch,
      activePriceRange.min,
      activePriceRange.max,
      inStockOnly,
      selectedSort,
      currentPage,
    ],
    queryFn: () =>
      api.getProducts({
        category: selectedCategory || undefined,
        search: appliedSearch || undefined,
        min_price: activePriceRange.min,
        max_price: activePriceRange.max,
        in_stock: inStockOnly ? true : undefined,
        ordering: selectedSort,
        page: currentPage,
        page_size: 12,
      }),
  });

  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchInput('');
    setAppliedSearch('');
    setSelectedPriceRangeIndex(0);
    setInStockOnly(false);
    setSelectedSort(SORT_OPTIONS[0].value);
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    !!selectedCategory ||
    !!appliedSearch ||
    selectedPriceRangeIndex !== 0 ||
    inStockOnly;

  return (
    <div className="py-8 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
            {urlOffers ? 'Special Offers & Discounts' : 'Shop All Groceries'}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Browse our fresh farm catalog with transparent INR prices and guaranteed harvest quality.
          </p>
        </div>

        {/* Mobile Filter Button & Sort Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 bg-white rounded-2xl border border-surface-border shadow-soft">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileFilterOpen((prev) => !prev)}
              className="lg:hidden flex items-center gap-2 py-2 px-3.5 rounded-xl bg-surface-subtle border border-surface-border text-xs font-semibold text-charcoal"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              Filters {hasActiveFilters && '(Active)'}
            </button>

            <span className="text-xs text-charcoal-muted font-medium">
              Showing <strong className="text-charcoal font-bold">{products.length}</strong> of{' '}
              <strong className="text-charcoal font-bold">{totalCount}</strong> products
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-muted hidden sm:inline" />
            <span className="text-xs text-charcoal-muted hidden sm:inline">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              aria-label="Sort products by"
              className="py-1.5 px-3 rounded-xl border border-surface-border bg-surface-subtle text-xs font-semibold text-charcoal focus:outline-hidden focus:border-brand-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-charcoal-muted">Active Filters:</span>
            {selectedCategory && (
              <span className="badge-category flex items-center gap-1">
                Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <button onClick={() => handleCategoryChange('')} aria-label="Remove category filter">
                  <X className="w-3 h-3 hover:text-brand-900" />
                </button>
              </span>
            )}
            {appliedSearch && (
              <span className="badge-category flex items-center gap-1">
                Search: "{appliedSearch}"
                <button
                  onClick={() => {
                    setSearchInput('');
                    setAppliedSearch('');
                  }}
                  aria-label="Remove search filter"
                >
                  <X className="w-3 h-3 hover:text-brand-900" />
                </button>
              </span>
            )}
            {selectedPriceRangeIndex !== 0 && (
              <span className="badge-category flex items-center gap-1">
                {PRICE_RANGES[selectedPriceRangeIndex].label}
                <button onClick={() => setSelectedPriceRangeIndex(0)} aria-label="Remove price filter">
                  <X className="w-3 h-3 hover:text-brand-900" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="badge-category flex items-center gap-1">
                In Stock Only
                <button onClick={() => setInStockOnly(false)} aria-label="Remove in stock filter">
                  <X className="w-3 h-3 hover:text-brand-900" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 ml-2"
            >
              Clear All Filters
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar Filters */}
          <aside
            className={`lg:block ${
              isMobileFilterOpen
                ? 'fixed inset-0 z-50 p-6 bg-white overflow-y-auto block'
                : 'hidden'
            } lg:relative lg:p-0 lg:bg-transparent`}
          >
            {isMobileFilterOpen && (
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border lg:hidden">
                <h3 className="text-base font-bold text-charcoal">Filter Catalog</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-xl text-charcoal-muted hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="bg-white p-5 rounded-3xl border border-surface-border shadow-soft space-y-6">
              {/* Search Inside Filter */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                  Search
                </label>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search produce..."
                    className="w-full pl-8 pr-3 py-2 bg-surface-subtle rounded-xl border border-surface-border text-xs focus:outline-hidden focus:border-brand-500"
                  />
                  <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-2.5 top-2.5" />
                </form>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                  Categories
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      !selectedCategory
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-charcoal hover:bg-surface-subtle'
                    }`}
                  >
                    All Aisles ({totalCount})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'text-charcoal hover:bg-surface-subtle'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.product_count !== undefined && (
                        <span className="text-[10px] text-charcoal-muted">
                          {cat.product_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                  Price Range
                </label>
                <div className="space-y-1">
                  {PRICE_RANGES.map((range, index) => (
                    <button
                      key={range.label}
                      onClick={() => {
                        setSelectedPriceRangeIndex(index);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        selectedPriceRangeIndex === index
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'text-charcoal hover:bg-surface-subtle'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                  Availability
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="rounded border-stone-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>Exclude out of stock items</span>
                </label>
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="w-full btn-secondary text-xs py-2 rounded-xl"
                >
                  Reset All Filters
                </button>
              )}

              {/* Mobile Close Button */}
              {isMobileFilterOpen && (
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full btn-primary text-xs py-2.5 rounded-xl lg:hidden"
                >
                  Apply & Close
                </button>
              )}
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalCount > 12 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      disabled={!productsData?.previous}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="btn-secondary text-xs py-2 px-4 rounded-xl disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-semibold text-charcoal px-3">
                      Page {currentPage} of {Math.ceil(totalCount / 12)}
                    </span>
                    <button
                      disabled={!productsData?.next}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="btn-secondary text-xs py-2 px-4 rounded-xl disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title="No matching groceries found"
                description="Try clearing your search query or adjusting your filters to discover fresh alternatives."
                actionText="Reset Filters"
                onAction={handleResetFilters}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
