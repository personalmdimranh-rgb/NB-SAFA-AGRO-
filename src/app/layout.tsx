import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Roboto,
  Montserrat,
  Playfair_Display,
  Outfit,
  Lora,
  Manrope,
  Urbanist,
  Orbitron,
  Open_Sans,
  Lato,
  Oswald,
  Raleway,
  Nunito,
  Ubuntu,
  Merriweather,
  Kanit,
  Quicksand,
  Josefin_Sans,
  Syne,
  Space_Grotesk,
  Jost
} from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./prosemirror.css";
import Script from "next/script";
import { PWARegistry } from "@/components/pwa-registry";
import GoogleTagManager from "./components/GoogleTagManager";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import FacebookPixel from "./components/FacebookPixel";
import { getCachedSettings } from "@/lib/data-fetching";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nbsafaagro.com'),
  title: {
    default: "NB SAFA AGRO - Premium Maize Silage & Livestock Farm Management",
    template: "%s | NB SAFA AGRO",
  },
  description: "NB SAFA AGRO is a premium high-starch corn silage producer in Dhaka, Bangladesh. Formulated for maximum dairy milk yields and healthy livestock weight gain.",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon-512x512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "NB SAFA AGRO",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "NB SAFA AGRO - Premium Maize Silage & Livestock Farm",
    description: "Premium high-starch corn silage producer in Dhaka, Bangladesh. Optimized for maximum dairy milk yields and healthy livestock weight gain.",
    url: "https://www.nbsafaagro.com",
    siteName: "NB SAFA AGRO",
    type: 'website',
    images: [
      {
        url: '/assets/images/Banner/Banner.webp',
        width: 1200,
        height: 630,
        alt: 'NB SAFA AGRO Silage Farm',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "NB SAFA AGRO - Premium Maize Silage & Livestock Farm",
    description: "Premium high-starch corn silage producer in Dhaka, Bangladesh. Optimized for maximum dairy milk yields and healthy livestock weight gain.",
    images: ['/assets/images/Banner/Banner.webp'],
  },
  alternates: {
    canonical: 'https://www.nbsafaagro.com',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getCachedSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NB SAFA AGRO",
    "url": "https://www.nbsafaagro.com",
    "logo": "https://www.nbsafaagro.com/favicon.ico",
    "description": "Premium high-starch corn silage producer in Dhaka, Bangladesh. Formulated for maximum dairy milk yields and healthy livestock weight gain.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Dhaka cantonment",
      "addressLocality": "Dhaka",
      "addressRegion": "Dhaka",
      "postalCode": "1206",
      "addressCountry": "BD"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+880 1711-583424",
      "contactType": "sales",
      "email": "sales@nbsafaagro.com",
      "areaServed": "BD",
      "availableLanguage": ["Bengali", "English"]
    }
  };

  const theme = settings?.uiTemplates?.theme;
  const themeClass = (theme && theme !== 'default') ? `theme-${theme.toLowerCase()}` : '';

  const bodyFont = settings?.uiTemplates?.bodyFont || 'inter';
  const logoFont = settings?.uiTemplates?.logoFont || 'orbitron';

  const fontClass = `font-${bodyFont}`;
  const logoFontClass = `logo-font-${logoFont}`;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${roboto.variable} ${montserrat.variable} ${playfair.variable} ${outfit.variable} ${lora.variable} ${manrope.variable} ${urbanist.variable} ${orbitron.variable} ${openSans.variable} ${lato.variable} ${oswald.variable} ${raleway.variable} ${nunito.variable} ${ubuntu.variable} ${merriweather.variable} ${kanit.variable} ${quicksand.variable} ${josefinSans.variable} ${syne.variable} ${spaceGrotesk.variable} ${jost.variable} ${themeClass} ${fontClass} ${logoFontClass}`} suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/assets/login_banner_v2.webp" />
        <link rel="preload" as="image" href="/assets/register_banner_v2.webp" />
        <link rel="preload" as="image" href="/assets/forgetpassrod.webp" />
      </head>
      <body
        className="antialiased min-h-full flex flex-col overflow-x-hidden font-sans"
        suppressHydrationWarning
      >
        <PWARegistry />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers settings={settings}>
          {settings?.googleTagManagerId && (
            <GoogleTagManager gtmId={settings.googleTagManagerId} />
          )}

          <Suspense fallback={null}>
            <FacebookPixel
              pixelId={settings?.metaPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}
            />
          </Suspense>

          <SmoothScroll>
            {children}
            <ScrollProgress />
          </SmoothScroll>
        </Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
