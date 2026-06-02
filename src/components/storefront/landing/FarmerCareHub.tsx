"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function FarmerCareHub() {
  return (
    <section className="py-12 md:py-16 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Visual Photo Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
            className="relative order-last md:order-first flex justify-center"
          >
            <div className="relative w-full max-w-sm group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-background border border-border rounded-2xl p-4 shadow-xl space-y-4 overflow-hidden">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border">
                  <Image
                    src="/assets/elite_dairy_cows.png"
                    alt="Elite Dairy Cows feeding"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    fill
                    sizes="(max-width: 768px) 100vw, 384px"
                  />
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border/40 pt-3">
                  <span className="font-bold text-foreground">Rumen Health & Milk Production</span>
                  <span className="text-[10px] text-primary font-mono font-bold">+15.4% Yield</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Care Hub Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="space-y-6 text-left"
          >

            <h2 className="text-3xl font-extrabold text-foreground font-heading leading-tight">Farmer & Cattle Care Hub</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Whether you own a local farm with 5 dairy cows or manage a major cooperative with 500 bulls, NB Safa Agro offers dedicated feed optimization assistance. Our distribution trucks provide door-to-door delivery across Bogura and surrounding districts.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-foreground">Diet Consultation</h4>
                <p className="text-xs text-muted-foreground font-medium">Free nutritional mapping for dairy cows and weight-gain bulls.</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-foreground">Bulk Logistics</h4>
                <p className="text-xs text-muted-foreground font-medium">Secure shipping with automated dispatch logs for large farm purchases.</p>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-4 px-6 rounded-lg transition-all duration-300">
                <Link href="/login">Access Farmer Purchase Portal</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
