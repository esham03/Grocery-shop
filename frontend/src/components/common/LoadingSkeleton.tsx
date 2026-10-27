import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="card-premium p-4 flex flex-col justify-between animate-pulse">
      <div className="w-full aspect-square bg-stone-200 rounded-xl mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-1/3 bg-stone-200 rounded" />
        <div className="h-4 w-3/4 bg-stone-200 rounded" />
        <div className="h-3 w-1/4 bg-stone-200 rounded" />
        <div className="h-3 w-1/2 bg-stone-200 rounded" />
      </div>
      <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
        <div className="h-5 w-16 bg-stone-200 rounded" />
        <div className="h-8 w-16 bg-stone-200 rounded-xl" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
