"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { contactConfig } from '@/lib/contact-config';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
  Activity,
  Truck,
  ShieldCheck,
  ArrowRight,
  Database,
  Award,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  label: string;
  icon: any;
  items: FAQItem[];
};

export default function FAQPage() {
  const categories: FAQCategory[] = [
    {
      id: 'silage',
      label: 'Silage Nutrition & Cattle Health',
      icon: Activity,
      items: [
        {
          question: "How does NB Safa Agro Maize Silage optimize dairy milk yield?",
          answer: "Our whole-crop maize silage is harvested at peak starch maturity (30-35% dry matter) and processed to a precise 10-15mm chop size. This delivers concentrated energy directly to the rumen, improving digestibility by up to 72% and increasing daily milk yields by an average of 15% per cow."
        },
        {
          question: "How do you guarantee the preservation and shelf life of the silage bags?",
          answer: "We compact the chopped silage and seal it inside heavy-duty, triple-layer UV-resistant bags. This creates a completely anaerobic environment, preventing any oxygen infiltration or mold growth. Under this hermetic vacuum, our silage remains fresh and nutritionally viable for up to 18 months."
        },
        {
          question: "Is NB Safa Agro silage free of aflatoxins and synthetic chemicals?",
          answer: "Yes, 100%. Every production batch undergoes strict laboratory wet-chemistry analysis to certify aflatoxin levels remain below 20 ppb (parts per billion). We use only whole-crop corn, premium molasses, and probiotic strains. We never add urea, synthetic preservatives, or artificial nitrogen feeds."
        },
        {
          question: "What is the recommended daily feeding ratio for dairy cows?",
          answer: "For standard milking cows, we recommend feeding 12 to 15 kg of silage per day, mixed with their dry roughage ration. This provides the optimal balance of fiber and metabolic starch energy needed to sustain milk production and maintain rumen pH balance."
        }
      ]
    },
    {
      id: 'dealer',
      label: 'Dealer Tiers & Logistics Program',
      icon: Truck,
      items: [
        {
          question: "How can a regional business apply to become an approved NB Safa Agro Dealer?",
          answer: "Interested regional distributors can apply through our Dealer Registry Portal. You must submit your trade license, shop details, NID card, and regional address. Once submitted, our office staff conducts an audit, approves the account, and assigns a credit limit boundary."
        },
        {
          question: "What are the standard credit limits and commission rates for regional distributors?",
          answer: "NB Safa Agro offers 3 main partner tiers: Authorized Partner (2% commission, 50K BDT credit limit), Executive Distributor (4% commission, 250K BDT credit limit), and Elite Agro Broker (6% commission, 1M BDT credit limit). Commisions are automatically deposited into your dealer wallet upon order completion."
        },
        {
          question: "How does the automated billing and digital ledger system work?",
          answer: "Every sale, shipment, and commission credit is logged on our central digital ledger. When a dealer places an order, the system instantly generates a digital invoice, calculates the commission, adjusts the credit limit, and posts the transaction to the dealer’s dashboard ledger."
        },
        {
          question: "Do you provide door-to-door delivery for bulk farmer cooperative orders?",
          answer: "Yes. NB Safa Agro operates a regional logistics network. Bulk shipments exceeding 15 tons are dispatched directly from our Bogura compacting hub to dairy farm cooperatives and distributors across surrounding districts in heavy-duty shipping trucks."
        }
      ]
    },
    {
      id: 'governance',
      label: 'Director Governance & Investment',
      icon: ShieldCheck,
      items: [
        {
          question: "How can directors monitor shares, capital equity, and dividend payout schedules?",
          answer: "Directors have secure access to a dedicated dashboard showing current equity shares, historical investment timelines, and automated dividend distribution logs. Dividend approvals can be released digitally through the dashboard in coordination with the super_admin."
        },
        {
          question: "How are batch production costs audited and checked for transparency?",
          answer: "Every production batch (ProductionBatch schema) records the quantity of raw corn, molasses volume, labor costs, and compacting bag costs. Directors can inspect these logs, verify the unit production cost, and review ledger ledger entries (LedgerTransaction schema) to audit overall profitability."
        },
        {
          question: "What security compliance frameworks protect corporate ledger transactions?",
          answer: "Our ledger uses strict schema validations for every bank or cash entry. Every transaction is tied to a verified office recordedBy user ID. Modifications are tracked with logs, ensuring that bank reconciliation audits are 100% accurate."
        }
      ]
    }
  ];

  const [activeCategory, setActiveCategory] = useState<string>('silage');
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  const currentCategory = categories.find(cat => cat.id === activeCategory) || categories[0];

  // Framer Motion Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  } as const;

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  } as const;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  } as const;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground">

      {/* 1. FAQ HERO HEADER */}
      <section className="relative bg-card text-card-foreground border-b border-border py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background opacity-60 pointer-events-none" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center space-y-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 backdrop-blur-md"
          >
            <HelpCircle className="h-3.5 w-3.5" /> NB Safa Agro Help Center
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight leading-none text-foreground font-heading"
          >
            Frequently Asked Questions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Find comprehensive answers regarding our premium maize silage composition, regional dealer distribution program, and corporate investor dashboard.
          </motion.p>
        </div>
      </section>

      {/* 2. FAQ INTERACTIVE CONTENT GRID */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-12 gap-8 items-start">

            {/* Category Selection Sidebar */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="md:col-span-4 flex flex-col gap-3 text-left"
            >
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2 mb-1 block">FAQ Categories</span>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    variants={fadeUp}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenFAQIndex(0); // open first FAQ when switching category
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-xs font-bold transition-all duration-300 text-left w-full ${activeCategory === cat.id
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${activeCategory === cat.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}

              {/* Sidebar Helpline widget */}
              <motion.div
                variants={scaleIn}
                className="mt-6 p-6 bg-card border border-border rounded-xl space-y-4 text-left relative overflow-hidden"
              >
                <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none">
                  <PhoneCall className="h-28 w-28 text-primary" />
                </div>
                <h4 className="font-extrabold text-sm text-foreground font-heading">Need Direct Support?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Can't find the answer you're looking for? Reach out to our customer support center.
                </p>
                <div className="space-y-2.5 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-primary shrink-0" />
                    <span>{contactConfig.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span>{contactConfig.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{contactConfig.address}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Accordion Questions List */}
            <div className="md:col-span-8 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={staggerContainer}
                  className="space-y-4 text-left"
                >
                  <h3 className="font-extrabold text-lg text-foreground font-heading pl-1 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    {currentCategory.label} Questions
                  </h3>

                  {currentCategory.items.map((item, index) => {
                    const isOpen = openFAQIndex === index;
                    return (
                      <motion.div
                        key={index}
                        variants={fadeUp}
                        className={`border rounded-xl bg-card overflow-hidden hover:border-primary/20 transition-colors duration-300 ${isOpen ? 'border-primary/40 shadow-sm' : 'border-border'
                          }`}
                      >
                        {/* Header Accordion trigger */}
                        <button
                          onClick={() => setOpenFAQIndex(isOpen ? null : index)}
                          className="flex justify-between items-center w-full p-5 text-left font-bold text-sm text-foreground focus:outline-none"
                        >
                          <span className="pr-4">{item.question}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-primary shrink-0 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''
                              }`}
                          />
                        </button>

                        {/* Content Accordion collapse */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/20">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Call-to-action bottom panel */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-foreground">Become a Regional Distributor Partner</h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Submit your trade license and shop credentials to unlock credit boundaries and wallet commission structures.
                  </p>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-4 px-5 rounded-lg shrink-0 w-full sm:w-auto">
                  <Link href="/login" className="flex items-center justify-center gap-1">
                    Apply for Dealer Portal <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
