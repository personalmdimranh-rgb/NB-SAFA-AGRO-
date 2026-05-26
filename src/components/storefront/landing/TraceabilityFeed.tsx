"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function TraceabilityFeed() {
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  useEffect(() => {
    const initialLogs = [
      `[${new Date().toLocaleTimeString()}] SYSTEM - Active. Cryptographic integrity synchronized.`,
      `[${new Date(Date.now() - 5000).toLocaleTimeString()}] BATCH #SA-2026-092 - 120 Tons compactor active.`,
      `[${new Date(Date.now() - 15000).toLocaleTimeString()}] LEDGER - Transaction generated: 450 Bags shipped to Sirajganj.`,
      `[${new Date(Date.now() - 25000).toLocaleTimeString()}] DEALER WALLET - Commission released to regional distributor.`,
      `[${new Date(Date.now() - 40000).toLocaleTimeString()}] LAB REPORT - Batch #SA-2026-091 verified Aflatoxin-Free.`
    ];
    setTelemetryLogs(initialLogs);

    const interval = setInterval(() => {
      const activities = [
        `BATCH #SA-2026-${Math.floor(Math.random() * 900 + 100)} - Compacted & Sealed under vacuum.`,
        `LEDGER - Invoice #INV-${Math.floor(Math.random() * 90000 + 10000)} generated.`,
        `DEALER WALLET - Commission payout released to registered distributor.`,
        `LAB REPORT - Mycological testing complete: Mold count < 10,000 CFU/g (Excellent Grade).`,
        `DISTRIBUTION - Dispatched 15 Tons silage bags to Dhaka North Division.`,
        `DIRECTOR MONITOR - Dividend release calculated & synced with shares allocation.`,
        `CATTLE METRIC - Dairy Farm report: 18.2% average fat yield increase reported.`
      ];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] ${randomActivity}`, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 md:py-16 bg-card border-b border-border">
      <div className="container mx-auto px-4 ">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="space-y-6 text-left"
          >

            <h2 className="text-3xl font-extrabold text-foreground font-heading leading-tight">Every Bag Tracked <br />From Harvest To Rumen</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We believe in total logistical transparency. Shafa Agro’s backend portal enables administrators and directors to track raw material intake, production batch codes, dealer transaction ledgers, and credit limits in real-time.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex gap-2.5 items-center font-semibold text-foreground">
                <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>Unique batch codes assigned to every compactor load</span>
              </div>
              <div className="flex gap-2.5 items-center font-semibold text-foreground">
                <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>Verifiable dry matter and starch lab test metrics</span>
              </div>
              <div className="flex gap-2.5 items-center font-semibold text-foreground">
                <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>Instant ledger updates for dealer sales commission wallets</span>
              </div>
            </div>
          </motion.div>

          {/* Traceability Telemetry Console */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl blur opacity-20" />
            <div className="relative bg-background border border-border/80 rounded-xl p-4 shadow-xl font-mono text-[11px] leading-relaxed select-none">
              <div className="flex justify-between items-center border-b border-border/60 pb-2 mb-3 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-pulse" />
                  <span className="font-semibold text-xs tracking-wider uppercase">Live Traceability Feed</span>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Active</span>
              </div>

              <div className="space-y-2 h-44 overflow-y-hidden text-left flex flex-col justify-start">
                <AnimatePresence>
                  {telemetryLogs.map((log) => (
                    <motion.div
                      key={log}
                      initial={{ opacity: 0, x: -15, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`border-l-2 pl-2 py-0.5 ${log.includes('SYSTEM')
                        ? 'border-muted text-muted-foreground'
                        : log.includes('BATCH')
                          ? 'border-primary text-foreground'
                          : log.includes('LAB')
                            ? 'border-primary/80 text-foreground font-bold'
                            : 'border-primary/45 text-muted-foreground'
                        }`}
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
