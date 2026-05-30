/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_cache } from 'next/cache';
import connectToDatabase from './db';
import Banner from '@/models/Banner';
import Blog from '@/models/Blog';
import FAQ from '@/models/FAQ';
import GlobalSettings from '@/models/GlobalSettings';
import Coupon from '@/models/Coupon';

// Helper to serialize MongoDB data
const serialize = (data: any) => JSON.parse(JSON.stringify(data));

/**
 * CACHE_TAGS constants for consistency
 */
export const CACHE_TAGS = {
  banners: 'banners',
  blogs: 'blogs',
  faqs: 'faqs',
  settings: 'settings',
  coupons: 'coupons',
};

// --- BANNERS ---

export const getCachedBanners = () => {
  return unstable_cache(
    async () => {
      await connectToDatabase();
      const banners = await Banner.find({ isActive: true })
        .sort({ order: 1 })
        .lean();
      return serialize(banners);
    },
    ['banners-list'],
    { revalidate: 60, tags: [CACHE_TAGS.banners] }
  )();
};

// --- BLOGS ---

export const getCachedBlogs = (limit = 10) => {
  return unstable_cache(
    async () => {
      await connectToDatabase();
      const blogs = await Blog.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      return serialize(blogs);
    },
    ['blogs-list', limit.toString()],
    { revalidate: 31536000, tags: [CACHE_TAGS.blogs] }
  )();
};

export const getCachedBlogBySlug = (slug: string) => {
  return unstable_cache(
    async () => {
      await connectToDatabase();
      const blog = await Blog.findOne({ slug, isPublished: true }).lean();
      return serialize(blog);
    },
    ['blog-detail', slug],
    { revalidate: 31536000, tags: [CACHE_TAGS.blogs] }
  )();
};

// --- FAQs ---

export const getCachedFAQs = () => {
  return unstable_cache(
    async () => {
      await connectToDatabase();
      const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 }).lean();
      return serialize(faqs);
    },
    ['faqs-list'],
    { revalidate: 31536000, tags: [CACHE_TAGS.faqs] }
  )();
};

// --- SETTINGS ---

/**
 * Fetches global settings for the storefront.
 */
export const getCachedSettings = () => {
  return unstable_cache(
    async () => {
      await connectToDatabase();

      // Find the first available settings record
      const settings = await GlobalSettings.findOne().lean();

      return serialize(settings);
    },
    ['global-settings'],
    { tags: [CACHE_TAGS.settings], revalidate: 3600 }
  )();
};

// --- COUPONS ---

export const getCachedActiveCoupon = () => {
  return unstable_cache(
    async () => {
      await connectToDatabase();
      const coupon = await Coupon.findOne({
        isActive: true,
        expiryDate: { $gt: new Date() }
      }).sort({ createdAt: -1 }).lean();
      return serialize(coupon);
    },
    ['active-coupon'],
    { revalidate: 3600, tags: [CACHE_TAGS.coupons] }
  )();
};
