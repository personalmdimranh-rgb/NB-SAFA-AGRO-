import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const BASE_URL = 'https://www.nbsafaagro.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/dashboard/', 
        '/api/', 
        '/checkout/', 
        '/login/', 
        '/register/', 
        '/forgot-password/', 
        '/reset-password/',
        '/wishlist/'
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

