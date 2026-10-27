import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { HeroSection } from '../components/home/HeroSection';
import { CategorySection } from '../components/home/CategorySection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { OffersBanner } from '../components/home/OffersBanner';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { NewsletterSection } from '../components/home/NewsletterSection';

export const HomePage: React.FC = () => {
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.getProducts({ page_size: 16 }),
    staleTime: 2 * 60 * 1000,
  });

  const products = productsData?.results || [];

  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategorySection categories={categories} isLoading={isCategoriesLoading} />
      <FeaturedSection products={products} isLoading={isProductsLoading} />
      <OffersBanner />
      <WhyChooseUs />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
};
