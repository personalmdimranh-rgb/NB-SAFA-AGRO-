"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Shield, BadgeDollarSign, FileText } from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function CorporateGovernance() {
  return (
    <section className="py-12 md:py-16 bg-background border-b border-border">
      <div className="container mx-auto px-4 text-center space-y-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="space-y-4 max-w-2xl mx-auto"
        >

          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Director Shareholder Audits</h2>
          <p className="text-muted-foreground text-sm">
            Secured shareholder access built into the core framework. Directors can monitor overall equity ratios, verify investment dates, track capital deposits, and inspect released dividend transactions.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 text-left"
        >
          {[
            {
              icon: Shield,
              title: "Equity Percentage Logs",
              desc: "Automated equity calculation based on director investments. Keeps a ledger-backed log of investor shares without manual spreadsheets."
            },
            {
              icon: BadgeDollarSign,
              title: "Automated Dividends",
              desc: "Directors review production costs and approve dividend release cycles. Calculations are instantly aligned to original equity ratios."
            },
            {
              icon: FileText,
              title: "Production Cost Audits",
              desc: "Track production costs per unit across batches. Instant verification of raw material costs (maize, molasses, compaction bags)."
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="p-6 bg-card border border-border rounded-xl space-y-4 shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="font-bold text-base text-foreground font-heading">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
