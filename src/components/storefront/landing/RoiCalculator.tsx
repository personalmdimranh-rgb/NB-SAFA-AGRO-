"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { TrendingUp, UserPlus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function RoiCalculator() {
  const [herdSize, setHerdSize] = useState<number>(50);
  const [milkYield, setMilkYield] = useState<number>(18);

  const dailyIncreasePerCow = milkYield * 0.15; // 15% average increase
  const totalDailyIncrease = herdSize * dailyIncreasePerCow;
  const monthlyRevenueGain = totalDailyIncrease * 30 * 75; // 75 BDT per Liter
  const recommendedBags = Math.round((herdSize * 15 * 30) / 40); // 15kg/day per cow, 40kg bag

  return (
    <section className="py-12 md:py-16 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center space-y-4 mb-12"
        >

          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Project Your Farm Revenue</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Simulate feed requirements and calculate milk yield revenue growth based on cattle headcount.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
          className="grid md:grid-cols-12 gap-8 items-stretch"
        >
          {/* Input Slider Panel */}
          <div className="md:col-span-7 bg-background p-6 rounded-2xl border border-border flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h3 className="font-bold text-base text-foreground font-heading border-b border-border/55 pb-2">Adjust Cattle Parameters</h3>

              {/* Slider 1: Herd Size */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Herd Size (Dairy Cows)</label>
                  <span className="px-2.5 py-1 bg-primary/10 text-primary font-bold font-mono text-sm rounded-md">
                    {herdSize} Head
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  value={herdSize}
                  onChange={(e) => setHerdSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>5 Cows</span>
                  <span>250 Cows</span>
                  <span>500 Cows</span>
                </div>
              </div>

              {/* Slider 2: Current Average Yield */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Current Yield Per Cow</label>
                  <span className="px-2.5 py-1 bg-primary/10 text-primary font-bold font-mono text-sm rounded-md">
                    {milkYield} Ltr/day
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={milkYield}
                  onChange={(e) => setMilkYield(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>5 Liters</span>
                  <span>20 Liters</span>
                  <span>40 Liters</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground border border-border/60">
                * Calculations are based on a 15% average increase in milk yield when switching from standard straw to premium high-starch maize silage, valued at 75 BDT per Liter.
              </div>
            </div>
          </div>

          {/* Calculations Result Output */}
          <div className="md:col-span-5 bg-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none animate-pulse">
              <TrendingUp className="w-56 h-56 text-primary" />
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-base text-foreground font-heading border-b border-primary/20 pb-2">Estimated Projections</h3>

              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground text-xs block">Additional Daily Milk Output</span>
                  <span className="text-2xl font-black text-primary font-mono">
                    +{totalDailyIncrease.toFixed(1)} Ltrs <span className="text-xs font-normal text-muted-foreground">/day</span>
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground text-xs block">Projected Monthly Revenue Uplift</span>
                  <span className="text-2xl font-black text-foreground font-mono">
                    {monthlyRevenueGain.toLocaleString()} BDT <span className="text-xs font-normal text-muted-foreground">/month</span>
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground text-xs block">Recommended Monthly Feed Order</span>
                  <span className="text-xl font-bold text-foreground font-mono">
                    {recommendedBags} Bags <span className="text-xs font-normal text-muted-foreground">(40 KG standard)</span>
                  </span>
                </div>
              </div>
            </div>

            <Button asChild className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-5 rounded-lg shadow-md transition-all duration-300">
              <Link href="/login" className="flex items-center justify-center gap-1.5">
                <UserPlus className="h-4 w-4" /> Place Distributor Order <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
