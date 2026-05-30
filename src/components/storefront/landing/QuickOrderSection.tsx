"use client";

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Truck, BadgeCheck, ArrowRight, Leaf, PhoneCall } from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const products = [
  {
    name: 'প্রিমিয়াম সাইলেজ ব্যাগ',
    weight: '৪০ কেজি',
    price: '৳৩৮০',
    badge: 'সবচেয়ে জনপ্রিয়',
    color: 'bg-primary/10 border-primary/30',
    badgeColor: 'bg-primary text-primary-foreground',
    icon: <Leaf className="h-6 w-6 text-primary" />,
  },
  {
    name: 'বাল্ক সাইলেজ প্যাক',
    weight: '১ টন',
    price: '৳৮,৫০০',
    badge: 'সাশ্রয়ী',
    color: 'bg-chart-2/10 border-chart-2/30',
    badgeColor: 'bg-chart-2 text-white',
    icon: <Package className="h-6 w-6 text-chart-2" />,
  },
  {
    name: 'ডিলার বিশেষ অফার',
    weight: '৫ টন+',
    price: 'আলোচনাসাপেক্ষ',
    badge: 'ডিলারদের জন্য',
    color: 'bg-chart-3/10 border-chart-3/30',
    badgeColor: 'bg-chart-3 text-white',
    icon: <Truck className="h-6 w-6 text-chart-3" />,
  },
];

const benefits = [
  { icon: <BadgeCheck className="h-5 w-5 text-primary" />, text: 'সরাসরি ফার্ম থেকে সতেজ সাইলেজ' },
  { icon: <Truck className="h-5 w-5 text-primary" />, text: 'বগুড়া ও আশপাশ জেলায় হোম ডেলিভারি' },
  { icon: <ShoppingCart className="h-5 w-5 text-primary" />, text: 'অনলাইনে বুকিং, পরে পেমেন্ট সুবিধা' },
  { icon: <PhoneCall className="h-5 w-5 text-primary" />, text: 'অর্ডারের আগে বিনামূল্যে পরামর্শ' },
];

export default function QuickOrderSection() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-border relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-2/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.35em] text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            <ShoppingCart className="h-3.5 w-3.5" /> সরাসরি অর্ডার করুন
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading leading-tight mb-4">
            আজই আপনার গবাদিপশুর জন্য{' '}
            <span className="text-primary">সাইলেজ বুক করুন</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            শফা অ্যাগ্রোর প্রিমিয়াম সাইলেজ সরাসরি আপনার দোরগোড়ায়। খামারি বা ডিলার — যে কেউ সহজেই অনলাইনে অর্ডার দিতে পারবেন।
          </p>
        </motion.div>

        {/* Product cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={i + 1}
              className={`relative rounded-2xl border-2 p-6 ${product.color} flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-background/70 shadow-sm">
                  {product.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${product.badgeColor}`}>
                  {product.badge}
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-lg leading-tight">{product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{product.weight} প্রতি ইউনিট</p>
              </div>
              <p className="text-2xl font-black text-foreground">{product.price}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          custom={4}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3 bg-muted/40 rounded-xl p-4 border border-border/60">
              <div className="mt-0.5 shrink-0">{b.icon}</div>
              <p className="text-xs font-semibold text-foreground leading-snug">{b.text}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          custom={5}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-full px-8 py-6 text-sm gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
          >
            <Link href="/dashboard/order-new">
              <ShoppingCart className="h-4 w-4" />
              এখনই অর্ডার করুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 py-6 text-sm font-bold border-primary/30 hover:bg-primary/5 gap-2 transition-all duration-300"
          >
            <Link href="/contact">
              <PhoneCall className="h-4 w-4 text-primary" />
              আগে পরামর্শ করুন
            </Link>
          </Button>
        </motion.div>

        {/* Small note */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeUp}
          custom={6}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          অর্ডার করতে অ্যাকাউন্ট থাকতে হবে।{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            বিনামূল্যে রেজিস্ট্রেশন করুন
          </Link>
        </motion.p>
      </div>
    </section>
  );
}
