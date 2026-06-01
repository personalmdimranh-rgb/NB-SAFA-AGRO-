"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UserPlus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    title: "Gold-Standard Silage Bags",
    subtitle: "Sealed vacuum compaction with UV protection",
    image: "/assets/silage_gold_bags.png",
    badge: "Anaerobic Cure"
  },
  {
    title: "High-Yield Dairy Cattle",
    subtitle: "Optimizing fat output & digestability",
    image: "/assets/elite_dairy_cows.png",
    badge: "Metabolic Boost"
  },
  {
    title: "QA Laboratory Audits",
    subtitle: "Certified aflatoxin-safe & high energy",
    image: "/assets/agro_lab_qa.png",
    badge: "Scientific Quality"
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-fit md:min-h-[90vh] flex items-center bg-card text-card-foreground border-b border-border overflow-hidden py-8 md:py-20">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />

      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-12 gap-6 md:gap-12 items-center">
        {/* Hero Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 space-y-4 md:space-y-6 text-left"
        >

          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight md:leading-none text-foreground font-heading">
            Nurturing Gold, <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
              Standardizing Growth
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            NB Safa Agro engineers premium fermented maize silage bags packed with high-value starches, probiotics, and nutrients. Empowering elite dairy farms and dealer networks with high-fidelity supply transparency.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 md:pt-4">
            <Button asChild size="sm" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs md:text-sm px-4 md:px-6 py-2 md:py-2.5 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
              <Link href="/login" className="flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5" /> Dealer Registration <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-border hover:bg-muted text-foreground text-xs md:text-sm font-semibold px-4 rounded-lg transition-all duration-300">
              <Link href="/login">Corporate Board Access</Link>
            </Button>
          </div>
        </motion.div>

        {/* Hero Right Column: Animated Slider Carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-6 relative flex justify-center w-full"
        >
          <div className="relative w-full max-w-lg group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-primary/40 rounded-2xl blur-lg opacity-30 group-hover:opacity-45 transition duration-1000" />

            <div className="relative w-full bg-card/90 backdrop-blur-xl rounded-2xl p-5 border border-border shadow-2xl overflow-hidden flex flex-col">
              {/* Carousel Image Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/30 border border-border mb-4">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Slide Indicators Overlay */}
                <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md text-primary border border-border text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                  {slides[currentSlide].badge}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border text-foreground flex items-center justify-center transition-all duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border text-foreground flex items-center justify-center transition-all duration-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Carousel Info Panel */}
              <div className="space-y-2 text-left px-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-extrabold tracking-wider text-foreground font-heading">
                    {slides[currentSlide].title}
                  </h3>
                  {/* Progress indicators dots */}
                  <div className="flex gap-1.5">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-primary w-5' : 'bg-muted-foreground/30'
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {slides[currentSlide].subtitle}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
