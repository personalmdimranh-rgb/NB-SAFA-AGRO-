"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import {
  ShieldCheck,
  Scale,
  FlaskConical,
  Award,
  PhoneCall
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function SafetyStandards() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 ">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Nutritional Safety & Lab Certifications</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Every production batch undergoes strict laboratory verification to ensure 100% safety parameters and nutrient viability.
          </p>
        </motion.div>

        {/* Grid Layout containing Lab Photo Card + Certifications */}
        <div className="grid lg:grid-cols-12 gap-8 items-center mb-16">
          {/* Lab QA Mockup Photo */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
            className="lg:col-span-4 flex justify-center w-full"
          >
            <div className="relative w-full max-w-xs group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur-md opacity-35" />
              <div className="relative bg-card border border-border rounded-xl p-3 shadow-lg">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border">
                  <Image
                    src="/assets/agro_lab_qa.png"
                    alt="NB Safa Agro Lab QA inspection"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                <div className="pt-2 text-left">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-0.5">Lab ID #SA-QA-09</span>
                  <span className="text-[10px] font-medium text-muted-foreground block">Wet-chemistry composition inspection</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Certifications Badges */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="lg:col-span-8 grid sm:grid-cols-2 gap-6"
          >
            {[
              {
                title: 'Aflatoxin Safe Feed',
                cert: 'Certified < 20 ppb',
                desc: 'Strict screening guarantees mold levels stay far below critical toxic thresholds for cattle milk health.',
                icon: ShieldCheck
              },
              {
                title: 'Digestibility Index',
                cert: 'NDFD30 > 72.4%',
                desc: 'Neutral detergent fiber digestibility certified by chemists to guarantee high milk conversion ratios.',
                icon: Scale
              },
              {
                title: 'Anaerobic pH Stability',
                cert: 'Optimal pH 3.84',
                desc: 'Proves the complete fermentation of maize crop into lactic acid, preventing mold development after bag sealing.',
                icon: FlaskConical
              },
              {
                title: 'Urea & Chemical Free',
                cert: '100% Organic Inoculation',
                desc: 'Contains only whole-crop corn, premium molasses, and probiotic strains. Zero synthetic nitrogen feeds added.',
                icon: Award
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="p-5 bg-card border border-border rounded-xl shadow-sm space-y-3.5 flex flex-col justify-between hover:border-primary/45 transition-colors duration-300 text-left"
                >
                  <div className="space-y-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm text-foreground font-heading">{item.title}</h3>
                      <span className="inline-block text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
                        {item.cert}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Quick Helpline banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
          className="p-8 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-left"
        >
          <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none">
            <PhoneCall className="h-40 w-40 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground font-heading">Connect With Our Supply Officers</h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              Are you a large-scale dairy farm owner or regional crop distributor? Call our central Bogura office directly to schedule a nutritional audit or bulk shipment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center shrink-0 w-full md:w-auto">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-foreground bg-background border border-border px-4 py-3 rounded-lg w-full sm:w-auto">
              <PhoneCall className="h-4 w-4 text-primary animate-bounce" />
              <span>Hotline: +880 1711-583424</span>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-5 px-5 rounded-lg shadow-md w-full sm:w-auto">
              <Link href="/login">Office Portal Login</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
