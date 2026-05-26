"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FlaskConical } from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function NutritionalGoldTabs() {
  const [activeTab, setActiveTab] = useState<'energy' | 'digest' | 'probiotic' | 'stability'>('energy');

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

          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Nutritional Gold Showcase</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Our forage is chopped, processed, and fermented at peak maturity to lock in essential dietary values.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-muted/40 p-1.5 rounded-xl border border-border/60"
        >
          {[
            { id: 'energy', label: 'Metabolic Energy' },
            { id: 'digest', label: 'Digestibility' },
            { id: 'probiotic', label: 'Probiotic Shield' },
            { id: 'stability', label: 'Anaerobic Stability' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === tab.id
                ? 'bg-card text-primary shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
                }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content Panels */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
          className="bg-card rounded-2xl border border-border p-6 md:p-8 min-h-[250px] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none animate-pulse">
            <FlaskConical className="w-80 h-80 text-primary" />
          </div>
          <AnimatePresence mode="wait">
            {activeTab === 'energy' && (
              <motion.div
                key="energy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground font-heading">High-Density Soluble Starch</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By harvesting the entire corn crop when grains are fully developed in the milk-line stage, we preserve maximum starches. This delivers the high-density metabolic energy required to increase daily cow milk liters.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Whole Grains Starch Concentration</span>
                      <span className="font-bold text-foreground">34.2%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '34.2%' }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs text-muted-foreground block">Net Energy Lactation</span>
                    <span className="text-lg font-bold text-foreground">6.8 MJ/kg DM</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs text-muted-foreground block">Natural Sugar Retention</span>
                    <span className="text-lg font-bold text-foreground">4.5% - 5.5%</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'digest' && (
              <motion.div
                key="digest"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground font-heading">Neutral Detergent Fiber Digestibility (NDFD30)</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our custom processing system slices maize stalks into precise 10-15mm chop profiles. This optimizes rumen fermentation and improves digestibility, allowing cows to absorb feed nutrients with minimal metabolic loss.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">NDFD30 Index</span>
                      <span className="font-bold text-foreground">72.4%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '72.4%' }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs text-muted-foreground block">Ideal Chop Length</span>
                    <span className="text-lg font-bold text-foreground">10 - 15 mm</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs text-muted-foreground block">Crude Fiber Density</span>
                    <span className="text-lg font-bold text-foreground">18% - 20%</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'probiotic' && (
              <motion.div
                key="probiotic"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground font-heading">Premium Probiotic Enrichment</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We inoculate the silage during packing with top-tier lactic acid bacteria and premium liquid molasses. This accelerates lactic acid production, promoting healthy cattle gut microbiota and protecting against bacterial pathogens.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Lactic Acid Ratio</span>
                      <span className="font-bold text-foreground">6.5%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs text-muted-foreground block">Gut Inoculants</span>
                    <span className="text-lg font-bold text-foreground">L. buchneri</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs text-muted-foreground block">Probiotic Viability</span>
                    <span className="text-lg font-bold text-foreground">10^6 CFU/g</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'stability' && (
              <motion.div
                key="stability"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground font-heading">Multi-Layer Vacuum Preservation</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A tight seal is critical for high-grade silage. We package the silage using high-compaction industrial machinery inside triple-layer UV-resistant heavy silage bags, ensuring zero aerobic deterioration.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Oxygen Exclusion Barrier</span>
                      <span className="font-bold text-foreground">100% Hermetic</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs text-muted-foreground block">Anaerobic Life</span>
                    <span className="text-lg font-bold text-foreground">18 Months</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 hover:border-primary/20 transition-all duration-300">
                    <span className="text-xs text-muted-foreground block">Aerobic Stability</span>
                    <span className="text-lg font-bold text-foreground">7 Days (Open)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
