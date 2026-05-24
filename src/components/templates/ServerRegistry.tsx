/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamic from 'next/dynamic';

// --- FOOTERS ---
const FooterV1 = dynamic(() => import('./footers/FooterV1'));
const FooterV2 = dynamic(() => import('./footers/FooterV2'));

export const FooterSelector = ({ style }: { style: string }) => {
  switch (style) {
    case 'v1': return <FooterV1 />;
    case 'v2': return <FooterV2 />;
    default: return <FooterV1 />;
  }
};

// --- PRODUCT DETAILS ---
const ProductDetailsV1 = dynamic(() => import('./product-details/ProductDetailsV1'));
const ProductDetailsV2 = dynamic(() => import('./product-details/ProductDetailsV2'));

export const ProductDetailsSelector = ({ style, product }: { style: string, product: any }) => {
  switch (style) {
    case 'v1': return <ProductDetailsV1 product={product} />;
    case 'v2': return <ProductDetailsV2 product={product} />;
    default: return <ProductDetailsV1 product={product} />;
  }
};

// --- BLOG DETAILS ---
const BlogDetailsV1 = dynamic(() => import('./blog-details/BlogDetailsV1'));

export const BlogDetailsSelector = ({ style, blog, readingTime }: { style: string, blog: any, readingTime: number }) => {
  switch (style) {
    case 'v1': return <BlogDetailsV1 blog={blog} readingTime={readingTime} />;
    default: return <BlogDetailsV1 blog={blog} readingTime={readingTime} />;
  }
};

// --- SHOP LISTING ---
const ShopV1 = dynamic(() => import('./shop-page/ShopV1'));

export const ShopListingSelector = ({ style, productCardStyle, products, categories, searchParams }: { style: string, productCardStyle?: string, products: any[], categories: any[], searchParams: any }) => {
  const activeStyle = style || 'v1';
  switch (activeStyle) {
    case 'v1': return <ShopV1 products={products} categories={categories} searchParams={searchParams} style={activeStyle} productCardStyle={productCardStyle} />;
    default: return <ShopV1 products={products} categories={categories} searchParams={searchParams} style={activeStyle} productCardStyle={productCardStyle} />;
  }
};

// --- BLOG LISTING ---
const BlogListingV1 = dynamic(() => import('./blog-listing/BlogListingV1'));

export const BlogListingSelector = ({ 
  style, 
  variant,
  blogs, 
  totalBlogs, 
  totalPages, 
  currentPage, 
  q,
  searchTerm
}: { 
  style?: string, 
  variant?: string,
  blogs: any[], 
  totalBlogs: number, 
  totalPages: number, 
  currentPage: number, 
  q?: string,
  searchTerm?: string
}) => {
  const activeStyle = style || variant || 'v1';
  const activeQ = q || searchTerm || '';

  switch (activeStyle) {
    case 'v1': return <BlogListingV1 blogs={blogs} totalBlogs={totalBlogs} totalPages={totalPages} currentPage={currentPage} q={activeQ} style={activeStyle} />;
    default: return <BlogListingV1 blogs={blogs} totalBlogs={totalBlogs} totalPages={totalPages} currentPage={currentPage} q={activeQ} style={activeStyle} />;
  }
};
