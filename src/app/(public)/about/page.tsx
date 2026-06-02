"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target,
  Eye,
  Leaf,
  Sprout,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  // Animation configurations
  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const cards = [
    {
      icon: Sprout,
      title: "Sustainable Sourcing",
      desc: "Contracting directly with regional maize farmers, securing premium fair-trade pricing and promoting organic crop cultivation."
    },
    {
      icon: ShieldCheck,
      title: "Strict Quality Control",
      desc: "Rigorous testing protocols confirming starch content and certifying safety metrics with aflatoxin levels below 20 ppb."
    },
    {
      icon: TrendingUp,
      title: "Maximizing Dairy Yields",
      desc: "Helping dairy farmers achieve up to 15% higher milk yields through optimized whole-crop maize silage rations."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground">

      {/* 1. HERO SECTION */}
      <section className="relative bg-card text-card-foreground border-b border-border py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background opacity-60 pointer-events-none" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center space-y-6 max-w-3xl">

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight leading-none text-foreground font-heading"
          >
            About NB Safa Agro
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Leading Bangladesh in premium high-starch corn silage production. Empowering dairy farmers, strengthening regional distribution networks, and engineering advanced livestock nutrition.
          </motion.p>
        </div>
      </section>

      {/* 2. OUR MISSION & OUR VISION SECTIONS */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 md:gap-12"
          >
            {/* Our Mission Section */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary group-hover:scale-110 transition-transform duration-300">
                <Target className="h-36 w-36" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-foreground font-heading">Our Mission</h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed flex-grow">
                Our mission is to revolutionize the livestock feed industry in Bangladesh by manufacturing and distributing high-starch, aflatoxin-free maize silage. We strive to provide farmers with cost-effective feed alternatives that optimize cattle health, increase daily milk yields, and maximize profitability. By integrating modern agricultural science with local farming practices, we aim to ensure nutritional security for farms across the country.
              </p>
            </motion.div>

            {/* Our Vision Section */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-36 w-36" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-foreground font-heading">Our Vision</h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed flex-grow">
                Our vision is to become the premier national benchmark for sustainable livestock nutrition and agro-farm management in Bangladesh. We envision a future where dairy and livestock farms operate at maximum efficiency, driven by premium silage technology and transparent digital ledger systems. NB Safa Agro aims to spearhead innovation in sustainable farming, creating positive ecological and economic impacts for generations to come.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION STATS & CARDS */}
      <section className="py-16 bg-muted/40 border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-foreground font-heading">Why Farmers Trust NB Safa Agro</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              We leverage modern processing technology and strict laboratory verification to deliver unmatched nutritional quality.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-3 gap-6"
          >
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-card border border-border rounded-xl p-6 space-y-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary inline-block">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-foreground font-heading">{card.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-12 bg-primary/5 border border-primary/20 rounded-3xl space-y-6"
          >

            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground font-heading">
              Ready to Upgrade Your Feed Program?
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Contact our sales desk or apply for an authorized dealer account to gain access to tiered commission structures and automated logistics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-4 px-6 rounded-lg w-full sm:w-auto">
                <Link href="/login" className="flex items-center gap-1">
                  Access Dealer Portal <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-border hover:bg-muted/40 font-bold text-xs py-4 px-6 rounded-lg w-full sm:w-auto text-muted-foreground hover:text-foreground">
                <Link href="/contact">
                  Talk to Our Experts
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
