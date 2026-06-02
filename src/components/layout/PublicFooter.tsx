import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Facebook } from '@/components/ui/social-icons';
import DeveloperLogo from '@/components/ui/developerlogo';
import { Logo } from '@/components/ui/logo';
import { contactConfig } from '@/lib/contact-config';

export default function PublicFooter() {
  const { address, phone, email, facebookUrl, whatsappUrl } = contactConfig;
  return (
    <footer className="relative bg-card text-card-foreground border-t border-border py-10 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-3 flex flex-col items-center text-center sm:items-start sm:text-left">
          <Logo 
            textClassName="text-sm sm:text-base md:text-xl text-primary font-bold tracking-tight uppercase" 
            imageClassName="size-7 sm:size-8 md:size-12" 
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Premium high-starch corn silage producer in Bogura, Bangladesh. Formulated for maximum dairy milk yields and healthy livestock weight gain.
          </p>
        </div>

        <div className="space-y-3 flex flex-col items-center text-center sm:items-start sm:text-left">
          <h4 className="text-foreground font-bold text-sm">Quick Navigation</h4>
          <div className="flex flex-col items-center sm:items-start space-y-1.5 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-primary hover:underline">About Us</Link>
            <Link href="/login" className="hover:text-primary hover:underline">Office Management Login</Link>
            <Link href="/login" className="hover:text-primary hover:underline">Dealer Register Portal</Link>
            <Link href="/team" className="hover:text-primary hover:underline">Our Team</Link>
          </div>
        </div>

        <div className="space-y-3 flex flex-col items-center text-center sm:items-start sm:text-left">
          <h4 className="text-foreground font-bold text-sm">Support</h4>
          <div className="flex flex-col items-center sm:items-start space-y-1.5 text-xs text-muted-foreground">
            <Link href="/faq" className="hover:text-primary hover:underline">Support & FAQs</Link>
            <Link href="/contact" className="hover:text-primary hover:underline">Contact Us</Link>
            <Link href="/terms" className="hover:text-primary hover:underline">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-primary hover:underline">Privacy Policy</Link>
          </div>
        </div>

        <div className="space-y-3 text-xs flex flex-col items-center text-center sm:items-start sm:text-left">
          <h4 className="text-foreground font-bold text-sm">Contact Address</h4>
          <div className="space-y-2 text-muted-foreground flex flex-col items-center sm:items-start">
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> {address}</p>
            <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" /> {phone}</p>
            <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" /> {email}</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center bg-card hover:bg-primary hover:text-white hover:border-primary text-muted-foreground hover:scale-110 transition-all duration-300 shadow-sm" 
              title="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center bg-card hover:bg-primary hover:text-white hover:border-primary text-muted-foreground hover:scale-110 transition-all duration-300 shadow-sm" 
              title="WhatsApp"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 border-t border-border mt-8 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-[10px] text-muted-foreground">
        <div>
          &copy; {new Date().getFullYear()} NB Safa Agro. All rights reserved.
        </div>
        <div className="flex items-center justify-center">
          <DeveloperLogo className="opacity-40 hover:opacity-100 transition-all duration-300" />
        </div>
      </div>
    </footer>
  );
}
