"use client";

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
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

export default function DistributorTiers() {
  return (
    <section className="py-12 md:py-16 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center space-y-4 mb-12"
        >

          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Premium Distributor Tiers</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            NB Safa Agro operates an exclusive regional dealer network. Register as a dealer and unlock higher commission structures and custom credit limits.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 items-stretch"
        >
          {[
            {
              title: 'Authorized Partner',
              commission: '2.0%',
              commissionText: 'per 50kg bag sold',
              credit: '50,000 BDT',
              perks: [
                'Standard product priority allocation',
                'Digital invoice generation',
                'Dedicated dealer account manager',
                'Basic promotional marketing materials'
              ],
              buttonStyle: 'outline'
            },
            {
              title: 'Executive Distributor',
              commission: '4.0%',
              commissionText: 'per 50kg bag sold',
              credit: '250,000 BDT',
              perks: [
                'Elevated product allocation priority',
                'Automatic commission wallet withdrawals',
                '15-day credit extension allowance',
                'Custom localized banner printing support',
                'Digital ledger audit reports'
              ],
              buttonStyle: 'primary',
              featured: true
            },
            {
              title: 'Elite Agro Broker',
              commission: '6.0%',
              commissionText: 'per 50kg bag sold',
              credit: '1,000,000 BDT',
              perks: [
                'Top-tier inventory allocation preference',
                'Custom credit boundaries',
                'Direct production hub truck logistics',
                '24/7 dedicated distributor hotline access',
                'Quarterly dividend sharing priority'
              ],
              buttonStyle: 'outline'
            }
          ].map((tier, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className={`p-6 rounded-2xl border flex flex-col justify-between relative hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${tier.featured
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                : 'border-border bg-card'
                }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20">
                  Recommended Tier
                </span>
              )}

              <div className="space-y-6 text-left">
                <div>
                  <h3 className="font-extrabold text-lg text-foreground font-heading">{tier.title}</h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-primary font-mono">{tier.commission}</span>
                    <span className="text-xs text-muted-foreground">{tier.commissionText}</span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">Standard Credit Limit</span>
                  <span className="text-lg font-bold text-foreground font-mono">{tier.credit}</span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">Distributor Perks</span>
                  <ul className="space-y-2 text-xs">
                    {tier.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex gap-2 items-start text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                {tier.buttonStyle === 'primary' ? (
                  <Button asChild className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-4 rounded-lg">
                    <Link href="/login">Apply for Executive Portal</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full border-border hover:bg-muted text-foreground font-bold text-xs py-4 rounded-lg">
                    <Link href="/login">Apply for License</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
