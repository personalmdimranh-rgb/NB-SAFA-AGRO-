import { Metadata } from 'next';
import { Mail, Phone, MapPin, ExternalLink, MessageCircleMore } from 'lucide-react';
import { Facebook, X, Instagram, Youtube } from '@/components/ui/social-icons';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

import { contactConfig } from '@/lib/contact-config';

export const metadata: Metadata = {
  title: 'Contact Us | NB SAFA AGRO',
  description: 'Get in touch with NB SAFA AGRO for any inquiries, support, or feedback.',
};

export default function ContactPage() {
  const { brandName, address, phone, email, facebookUrl, whatsappUrl } = contactConfig;

  const contactItems = [
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Call Us",
      value: phone,
      href: `tel:${phone.replace(/\s+/g, '')}`,
      label: "Call Now",
      isExternal: false
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email Us",
      value: email,
      href: `mailto:${email}`,
      label: "Send Email",
      isExternal: false
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Visit Us",
      value: address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      label: "Get Directions",
      isExternal: true
    },
    {
      icon: <MessageCircleMore className="h-6 w-6 text-primary" />,
      title: "Chat on WhatsApp",
      value: phone,
      href: whatsappUrl,
      label: "Start Chat",
      isExternal: true
    }
  ];

  const socialItems = [
    { name: 'Facebook', icon: <Facebook className="h-5 w-5" />, url: facebookUrl },
    { name: 'WhatsApp', icon: <MessageCircleMore className="h-5 w-5" />, url: whatsappUrl },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions about our premium silage or services? We&apos;re here to help. Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Cards Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactItems.map((item, idx) => (
              <Card key={idx} className="border-none shadow-md hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-6 break-all max-w-[240px] text-xs">
                    {item.value}
                  </p>
                  <a 
                    href={item.href} 
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    {item.label} <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="mb-16" />

          {/* Map and Socials */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Location</h2>
                <p className="text-muted-foreground mb-6">
                  Visit our production hub or offices in Bogura. Our team is always ready to coordinate your feedstock shipments.
                </p>
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md border bg-muted">
                    <iframe 
                      title="NB SAFA AGRO Location"
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                </div>
              </div>
            </div>

            <div className="space-y-8 lg:pl-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Connect With Us</h2>
                <p className="text-muted-foreground mb-8">
                  Follow us on social media or reach out on WhatsApp to stay updated with our latest corn silage production batches, logs, and dealer commissions.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  {socialItems.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="h-12 w-12 rounded-full border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm text-foreground"
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
                <h4 className="font-bold text-lg mb-2">Support Hours</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground font-serif">Sat - Thu:</span>
                  <span className="font-medium">10:00 AM - 9:00 PM</span>
                  <span className="text-muted-foreground font-serif">Friday:</span>
                  <span className="font-medium text-primary">Off Day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
