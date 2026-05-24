"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface CounterProps {
  value: number;
  duration?: number;
}

function Counter({ value, duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * (endValue - startValue) + startValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

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

export default function OperationalStats() {
  return (
    <section className="py-20 bg-background border-b border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center space-y-4 mb-12"
        >
          <span className="text-xs font-bold text-primary tracking-widest uppercase">Shafa Agro Scale</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Our Operational Impact</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Real-time metrics indicating our manufacturing volume, client base reach, and regional distribution footprint.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { label: 'Maize Silage Fermented', value: 2840, suffix: '+ Tons', detail: 'Anaerobic storage vault capacity' },
            { label: 'Elite Farms Served', value: 420, suffix: '+ Farms', detail: 'Direct feed clients & cooperatives' },
            { label: 'Active Registered Dealers', value: 85, suffix: '+ Regions', detail: 'Regional distribution partners' },
            { label: 'Cattle Nourished Daily', value: 18500, suffix: '+ Head', detail: 'Improved digestive health indexes' }
          ].map((stat, idx) => {
            return (
              <motion.div 
                key={idx} 
                variants={fadeUp}
                className="p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
              >
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary/20 animate-ping" />
                <div className="space-y-2 text-left">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</h3>
                  <p className="text-3xl font-black text-primary font-mono tracking-tight">
                    <Counter value={stat.value} />{stat.suffix}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal mt-2 border-t border-border/40 pt-2">{stat.detail}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
