"use client";

import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/storefront/landing/HeroSection';
import NutritionalGoldTabs from '@/components/storefront/landing/NutritionalGoldTabs';
import RoiCalculator from '@/components/storefront/landing/RoiCalculator';
import OperationalStats from '@/components/storefront/landing/OperationalStats';
import TraceabilityFeed from '@/components/storefront/landing/TraceabilityFeed';
import DistributorTiers from '@/components/storefront/landing/DistributorTiers';
import FarmerCareHub from '@/components/storefront/landing/FarmerCareHub';
import QuickOrderSection from '@/components/storefront/landing/QuickOrderSection';
import CorporateGovernance from '@/components/storefront/landing/CorporateGovernance';
import HarvestingJourney from '@/components/storefront/landing/HarvestingJourney';
import SafetyStandards from '@/components/storefront/landing/SafetyStandards';
import RecentBlogs from '@/components/storefront/landing/RecentBlogs';
import { FAQSection } from '@/components/storefront/FAQSection';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ShafaAgroLandingPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    fetch('/api/faqs')
      .then(async res => {
        if (res.ok) return res.json();
        let errorDetails = '';
        try {
          errorDetails = await res.text();
        } catch (_) {
          errorDetails = 'Could not parse response body';
        }
        console.error(`Failed to fetch FAQs: ${res.status} ${res.statusText}. Response: ${errorDetails}`);
        throw new Error(`HTTP error! status: ${res.status}`);
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid FAQ payload: expected an array');
        }
        const validatedFaqs: FAQ[] = data.map((item: any) => {
          if (typeof item?.question !== 'string' || typeof item?.answer !== 'string') {
            throw new Error('Invalid FAQ payload item: missing question or answer');
          }
          return {
            id: String(item._id || item.id || ''),
            question: item.question,
            answer: item.answer,
            order: typeof item.order === 'number' ? item.order : undefined,
            isActive: typeof item.isActive === 'boolean' ? item.isActive : undefined,
            createdAt: item.createdAt ? String(item.createdAt) : undefined,
            updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
          };
        });
        setFaqs(validatedFaqs);
      })
      .catch(err => {
        console.error('Failed to fetch FAQs:', err);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground">
      <HeroSection />
      <NutritionalGoldTabs />
      <RoiCalculator />
      <OperationalStats />
      <TraceabilityFeed />
      <DistributorTiers />
      <FarmerCareHub />
      <QuickOrderSection />
      <CorporateGovernance />
      <HarvestingJourney />
      <SafetyStandards />
      <FAQSection faqs={faqs} />
      <RecentBlogs />
    </div>
  );
}
