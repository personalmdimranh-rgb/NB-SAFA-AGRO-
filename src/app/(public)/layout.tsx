import React from 'react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

export const metadata: Metadata = {
  metadataBase: new URL('https://shafaagro.com'),
  title: {
    default: "NB SAFA AGRO - Premium Maize Silage & Livestock Farm Management",
    template: "%s | NB SAFA AGRO",
  },
  description: "NB SAFA AGRO is a premium high-starch corn silage producer in Bogura, Bangladesh. Formulated for maximum dairy milk yields and healthy livestock weight gain.",
  alternates: {
    canonical: 'https://shafaagro.com',
  },
  openGraph: {
    title: "NB SAFA AGRO - Premium Maize Silage & Livestock Farm",
    description: "Premium high-starch corn silage producer in Bogura, Bangladesh. Optimized for maximum dairy milk yields and healthy livestock weight gain.",
    url: "https://shafaagro.com",
    siteName: "NB SAFA AGRO",
    type: 'website',
    images: [
      {
        url: '/assets/images/Banner/Banner.webp',
        width: 1200,
        height: 630,
        alt: 'NB SAFA AGRO Silage Farm',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "NB SAFA AGRO - Premium Maize Silage & Livestock Farm",
    description: "Premium high-starch corn silage producer in Bogura, Bangladesh. Optimized for maximum dairy milk yields and healthy livestock weight gain.",
    images: ['/assets/images/Banner/Banner.webp'],
  },
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Public Header Navigation */}
      <PublicHeader session={session} />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
