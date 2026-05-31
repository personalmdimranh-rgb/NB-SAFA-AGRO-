import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import DeveloperLogo from '@/components/ui/developerlogo';

export default function PublicFooter() {
  return (
    <footer className="relative bg-card text-card-foreground border-t border-border py-10 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <h3 className="text-foreground font-extrabold text-lg font-logo">NB SAFA AGRO</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Premium high-starch corn silage producer in Bogura, Bangladesh. Formulated for maximum dairy milk yields and healthy livestock weight gain.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-foreground font-bold text-sm">Quick Navigation</h4>
          <div className="flex flex-col space-y-1.5 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-primary hover:underline">Office Management Login</Link>
            <Link href="/login" className="hover:text-primary hover:underline">Dealer Register Portal</Link>
            <Link href="/team" className="hover:text-primary hover:underline">Our Team</Link>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-foreground font-bold text-sm">Support</h4>
          <div className="flex flex-col space-y-1.5 text-xs text-muted-foreground">
            <Link href="/faq" className="hover:text-primary hover:underline">Support & FAQs</Link>
            <Link href="/contact" className="hover:text-primary hover:underline">Contact Us</Link>
            <Link href="/terms" className="hover:text-primary hover:underline">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-primary hover:underline">Privacy Policy</Link>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <h4 className="text-foreground font-bold text-sm">Contact Address</h4>
          <div className="space-y-2 text-muted-foreground">
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> Bogura Sadar, Bogura, Bangladesh</p>
            <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" /> +880 1700-000000</p>
            <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" /> sales@shafaagro.com</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 text-center text-[10px] text-muted-foreground border-t border-border mt-8 pt-4">
        &copy; {new Date().getFullYear()} NB Safa Agro. All rights reserved.
      </div>

      {/* Developer logo — absolute bottom-right corner */}
      <div className="absolute bottom-4 right-6">
        <DeveloperLogo className="opacity-40 hover:opacity-100 transition-all duration-300" />
      </div>
    </footer>
  );
}
