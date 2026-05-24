/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamic from 'next/dynamic';

// --- NAVBARS ---
const NavbarV1 = dynamic(() => import('./navbars/NavbarV1'));
const NavbarV2 = dynamic(() => import('./navbars/NavbarV2'));

export const NavbarSelector = ({ style }: { style: string }) => {
  switch (style) {
    case 'v1': return <NavbarV1 />;
    case 'v2': return <NavbarV2 />;
    default: return <NavbarV1 />;
  }
};

// --- HEROS ---
const HeroV1 = dynamic(() => import('./heros/HeroV1'));
const HeroV2 = dynamic(() => import('./heros/HeroV2'));

export const HeroSelector = ({ style, banners }: { style: string, banners: any[] }) => {
  switch (style) {
    case 'v1': return <HeroV1 banners={banners} />;
    case 'v2': return <HeroV2 banners={banners} />;
    default: return <HeroV1 banners={banners} />;
  }
};

// --- PRODUCT CARDS ---
const ProductCardV6 = dynamic(() => import('./product-cards/ProductCardV6'));

export const ProductCardSelector = ({ style, product, isFlashSale, priority }: { style: string, product: any, isFlashSale?: boolean, priority?: boolean }) => {
  // Always use ProductCardV6 as requested by the user
  return <ProductCardV6 product={product} isFlashSale={isFlashSale} priority={priority} />;
};

// --- CATEGORIES ---
const CategoryV1 = dynamic(() => import('./categories/CategoryV1'));

export const CategorySelector = ({ style, categories }: { style: string, categories: any[] }) => {
  switch (style) {
    case 'v1': return <CategoryV1 categories={categories} />;
    default: return <CategoryV1 categories={categories} />;
  }
};
