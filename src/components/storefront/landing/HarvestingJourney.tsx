"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

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

export default function HarvestingJourney() {
  return (
    <section className="py-12 md:py-16 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center space-y-4 mb-16"
        >

          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">The Harvesting & Fermentation Journey</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            How we harvest whole-crop maize and package it to lock in optimal starches and sugars.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-4 gap-8 relative"
        >
          {/* Horizontal line on desktop */}
          <div className="hidden md:block absolute top-7 left-8 right-8 h-0.5 bg-border z-0" />

          {[
            {
              step: '01',
              title: 'Milk-Line Harvesting',
              desc: 'Whole-crop maize is harvested at peak maturity when grains are at 1/3 to 1/2 milk-line, giving optimal 30-35% dry matter.'
            },
            {
              step: '02',
              title: 'Micro-Chop Slicing',
              desc: 'Maize is sliced into precise 10-15mm fragments, preparing the fibers for optimal digestion and cow rumination.'
            },
            {
              step: '03',
              title: 'Inoculation & Packing',
              desc: 'Raw materials are blended with molasses and probiotics, then compressed by high-compaction tools to remove oxygen.'
            },
            {
              step: '04',
              title: 'Hermetic Bagging',
              desc: 'Silage is packed in heavy-duty UV-barrier bags and vacuum sealed, initiating a 21-day anaerobic fermentation cycle.'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4 group"
            >
              <div className="w-14 h-14 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center font-bold text-lg font-mono shadow-md group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {item.step}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-sm text-foreground font-heading">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
