"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle, 
  ShieldCheck, 
  Heart, 
  UserPlus, 
  PhoneCall, 
  TrendingUp, 
  BarChart3, 
  Database, 
  BadgeDollarSign, 
  Truck, 
  Award, 
  Shield, 
  FileText, 
  ArrowRight, 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Info, 
  Calendar, 
  DollarSign, 
  Layers, 
  Check, 
  FlaskConical, 
  Scale 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShafaAgroLandingPage() {
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState<number>(0);
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

  // Section 2: Nutritional Tabs State
  const [activeTab, setActiveTab] = useState<'energy' | 'digest' | 'probiotic' | 'stability'>('energy');

  // Section 3: Calculator State
  const [herdSize, setHerdSize] = useState<number>(50);
  const [milkYield, setMilkYield] = useState<number>(18);

  // Projections calculations
  const dailyIncreasePerCow = milkYield * 0.15; // 15% average increase
  const totalDailyIncrease = herdSize * dailyIncreasePerCow;
  const monthlyRevenueGain = totalDailyIncrease * 30 * 75; // 75 BDT per Liter
  const recommendedBags = Math.round((herdSize * 15 * 30) / 40); // 15kg/day per cow, 40kg bag

  // Section 5: Telemetry Traceability Feed State
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

  // Framer Motion Scroll Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  } as const;

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  } as const;

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground">
      
      {/* SECTION 1: HERO SECTION (LUXURY GRAND ENTRANCE WITH SLIDER CAROUSEL) */}
      <section className="relative min-h-[90vh] flex items-center bg-card text-card-foreground border-b border-border overflow-hidden py-16 lg:py-24">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />

        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              The Golden Standard of Livestock Nutrition
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-foreground font-heading">
              Nurturing Gold, <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                Standardizing Growth
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              NB Safa Agro engineers premium fermented maize silage bags packed with high-value starches, probiotics, and nutrients. Empowering elite dairy farms and dealer networks with high-fidelity supply transparency.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm px-6 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                <Link href="/login" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Dealer Registration <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border hover:bg-muted text-foreground font-semibold rounded-lg transition-all duration-300">
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
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={handleNextSlide}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border text-foreground flex items-center justify-center transition-all duration-300"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
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
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            currentSlide === index ? 'bg-primary w-5' : 'bg-muted-foreground/30'
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


      {/* SECTION 2: NUTRITIONAL GOLD SPEC TABS (FADE-IN ANIMATED) */}
      <section className="py-20 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center space-y-4 mb-12"
          >
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Nutritional Composition</span>
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
                className={`py-3 px-4 rounded-lg text-xs font-bold transition-all duration-300 ${
                  activeTab === tab.id 
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


      {/* SECTION 3: INTERACTIVE DAIRY YIELD & ROI CALCULATOR (SLIDE UP ON SCROLL) */}
      <section className="py-20 bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center space-y-4 mb-12"
          >
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Dynamic Yield ROI Calculator</span>
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


      {/* SECTION 4: LIVE STATISTICS COUNTER (FADE-UP & PULSE METRICS) */}
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
              { label: 'Maize Silage Fermented', value: '2,840+ Tons', detail: 'Anaerobic storage vault capacity', icon: Database },
              { label: 'Elite Farms Served', value: '420+ Farms', detail: 'Direct feed clients & cooperatives', icon: Award },
              { label: 'Active Registered Dealers', value: '85+ Regions', detail: 'Regional distribution partners', icon: Truck },
              { label: 'Cattle Nourished Daily', value: '18,500+ Head', detail: 'Improved digestive health indexes', icon: Heart }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={idx} 
                  variants={fadeUp}
                  className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-4 hover:border-primary/50 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary/20 animate-ping" />
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</h3>
                    <p className="text-2xl font-black text-foreground font-mono">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-normal">{stat.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>


      {/* SECTION 5: ECOSYSTEM & TRACEABILITY FEED (STAGGERED SLIDE ENTRANCE) */}
      <section className="py-20 bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="space-y-6 text-left"
            >
              <span className="text-xs font-bold text-primary tracking-widest uppercase">Ecosystem Traceability</span>
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
                    {telemetryLogs.map((log, idx) => (
                      <motion.div 
                        key={log}
                        initial={{ opacity: 0, x: -15, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`border-l-2 pl-2 py-0.5 ${
                          log.includes('SYSTEM') 
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


      {/* SECTION 6: THE PREMIUM DEALER TIERS (BUSINESS PARTNERSHIPS - STAGGER SLIDE) */}
      <section className="py-20 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center space-y-4 mb-12"
          >
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Distribution Program</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Premium Distributor Tiers</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Shafa Agro operates an exclusive regional dealer network. Register as a dealer and unlock higher commission structures and custom credit limits.
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
                commissionText: 'per 40KG bag sold',
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
                commissionText: 'per 40KG bag sold',
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
                commissionText: 'per 40KG bag sold',
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
                className={`p-6 rounded-2xl border flex flex-col justify-between relative hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${
                  tier.featured 
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


      {/* SECTION 7: FARMER & CATTLE CARE HUB (INCORPORATING REAL CATTLE PHOTO MOCKUP) */}
      <section className="py-20 bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visual Photo Card */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
              className="relative order-last md:order-first flex justify-center"
            >
              <div className="relative w-full max-w-sm group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur-lg opacity-40" />
                <div className="relative bg-background border border-border rounded-2xl p-4 shadow-xl space-y-4 overflow-hidden">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border">
                    <img 
                      src="/assets/elite_dairy_cows.png" 
                      alt="Elite Dairy Cows feeding" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-border/40 pt-3">
                    <span className="font-bold text-foreground">Rumen Health & Milk Production</span>
                    <span className="text-[10px] text-primary font-mono font-bold">+15.4% Yield</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Care Hub Text */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="space-y-6 text-left"
            >
              <span className="text-xs font-bold text-primary tracking-widest uppercase">Cattle Performance Optimization</span>
              <h2 className="text-3xl font-extrabold text-foreground font-heading leading-tight">Farmer & Cattle Care Hub</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether you own a local farm with 5 dairy cows or manage a major cooperative with 500 bulls, Shafa Agro offers dedicated feed optimization assistance. Our distribution trucks provide door-to-door delivery across Bogura and surrounding districts.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-foreground">Diet Consultation</h4>
                  <p className="text-xs text-muted-foreground font-medium">Free nutritional mapping for dairy cows and weight-gain bulls.</p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-foreground">Bulk Logistics</h4>
                  <p className="text-xs text-muted-foreground font-medium">Secure shipping with automated dispatch logs for large farm purchases.</p>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-4 px-6 rounded-lg transition-all duration-300">
                  <Link href="/login">Access Farmer Purchase Portal</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* SECTION 8: CORPORATE GOVERNANCE (DIRECTOR & SHAREHOLDER PANELS - FADE UP) */}
      <section className="py-20 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="space-y-4 max-w-2xl mx-auto"
          >
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Director Board & Governance</span>
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


      {/* SECTION 9: LUXURY SILAGE FEED PREPARATION GUIDE (PROCESS ROADMAP TIMELINE) */}
      <section className="py-20 bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center space-y-4 mb-16"
          >
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Manufacturing Pipeline</span>
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


      {/* SECTION 10: NUTRITIONAL SAFETY STANDARDS & LAB CERTIFICATIONS (WITH LAB MOCK PHOTO) */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center space-y-4 mb-12"
          >
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Laboratory Verification</span>
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
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border">
                    <img 
                      src="/assets/agro_lab_qa.png" 
                      alt="Shafa Agro Lab QA inspection" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
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
                <span>Hotline: +880 1700-000000</span>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-5 px-5 rounded-lg shadow-md w-full sm:w-auto">
                <Link href="/login">Office Portal Login</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
