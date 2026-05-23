import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle, ShieldCheck, Heart, UserPlus, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShafaAgroLandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
      {/* Dynamic Theme Hero Section */}
      <section className="relative bg-card text-card-foreground border-b border-border overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-background opacity-70"></div>
        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> High-Starch Maize Silage Feed
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-foreground font-heading">
              Optimize Livestock Milk Yields & Growth
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              NB Safa Agro produces premium fermented maize silage bags, packed with high-quality starches, natural molasses, and probiotics. The ultimate fodder for healthy dairy cows and bulls.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm px-6 transition-all">
                <Link href="/login" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Dealer Registration <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border hover:bg-muted text-foreground font-semibold transition-all">
                <Link href="/login">Office Staff Login</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* Silage Mockup Card */}
            <div className="w-full max-w-sm bg-card backdrop-blur-md rounded-2xl p-6 border border-border shadow-xl space-y-6 text-card-foreground">
              <div className="border-b border-border pb-4 text-center">
                <h3 className="text-xl font-bold tracking-wider text-foreground font-logo">Premium Silage Bag</h3>
                <span className="text-xs font-semibold text-primary">Standard Net Wt. 40 KG</span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dry Matter (DM)</span>
                  <span className="font-bold text-foreground">65% - 70%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Starch Content</span>
                  <span className="font-bold text-foreground">30% - 35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Crude Protein (CP)</span>
                  <span className="font-bold text-foreground">8.5% - 9.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">pH Fermentation Level</span>
                  <span className="font-bold text-foreground">3.8 - 4.2</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs text-center text-muted-foreground font-medium">
                  * 100% natural, containing maize grain, premium molasses, and lactic acid bacteria.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center max-w-4xl space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">Why NB Safa Agro Maize Silage?</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Our silage undergoes strict anaerobic fermentation to ensure preservation and boost cattle digestive health.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-card rounded-xl space-y-3 border border-border shadow-sm">
              <CheckCircle className="h-8 w-8 text-primary" />
              <h3 className="font-bold text-lg text-foreground font-heading">Nutrient Dense</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Contains high-starch whole maize plants harvested at optimum milk line stage for maximized energy levels.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl space-y-3 border border-border shadow-sm">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h3 className="font-bold text-lg text-foreground font-heading">Preserved Integrity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Packed in heavy duty UV-resistant silage bags to prevent oxygen infiltration, mold formation, and spoilage.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl space-y-3 border border-border shadow-sm">
              <Heart className="h-8 w-8 text-primary" />
              <h3 className="font-bold text-lg text-foreground font-heading">Boosts Dairy Yields</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Increases cow daily milk production yields and enhances rapid rumen digestability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dealer Partnership Highlight */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <h2 className="text-3xl font-extrabold text-foreground font-heading leading-tight">Become a Regional Distributor Partner</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              NB Safa Agro operates a premium distribution channel across Bangladesh. Registered dealers enjoy competitive commissions, credit extensions, automated digital invoices, and marketing assets.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2 items-center text-xs font-semibold text-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</span>
                <span>Submit Trade License & Shop Details</span>
              </div>
              <div className="flex gap-2 items-center text-xs font-semibold text-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</span>
                <span>Receive Office Approval & Assigned Credit limit</span>
              </div>
              <div className="flex gap-2 items-center text-xs font-semibold text-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</span>
                <span>Order Silage & Earn Commissions on the fly</span>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all">
                <Link href="/login">Apply for Dealer Portal</Link>
              </Button>
            </div>
          </div>

          <div className="bg-card text-card-foreground p-8 rounded-2xl border border-border shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-[0.03]">
              <Sparkles className="h-60 w-60 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground font-heading">Direct Order & Inquiries</h3>
            <p className="text-xs text-muted-foreground font-medium">
              Are you a bulk dairy farm owner? Connect directly with our distribution officers to get bulk shipment rates.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <PhoneCall className="h-4 w-4 text-primary" />
                <span>Call Center: +880 1700-000000</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Office: Bogura Sadar, Bogura, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
