"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText, ShieldCheck, Award, Briefcase, FileCheck, DollarSign,
  TrendingUp, Truck, Users, Image as ImageIcon, AlertTriangle,
  Calendar, Settings, CheckCircle2, ChevronDown, ChevronUp, Download, ArrowLeft, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Section {
  id: number;
  title: string;
  icon: any;
  content: React.ReactNode;
}



export default function DealerPolicyPage() {
  const [expandedSection, setExpandedSection] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/assets/dealer_policy_agreement.pdf';
    link.download = 'dealer_policy_agreement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSection = (id: number) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const sections: Section[] = [
    {
      id: 1,
      title: "১. ভূমিকা (Introduction)",
      icon: FileText,
      content: (
        <p className="leading-relaxed text-sm md:text-base text-muted-foreground">
          NB SAFA AGRO সারা দেশে নিরাপদ, মানসম্মত ও আধুনিক কৃষি এবং প্রাণিসম্পদভিত্তিক পণ্য ও সেবা পৌঁছে দেওয়ার লক্ষ্যে যোগ্য, সৎ ও দক্ষ ডিলার নিয়োগ করে থাকে। এই নীতিমালা অনুযায়ী প্রত্যেক ডিলার কোম্পানির প্রতিনিধি হিসেবে দায়িত্ব পালন করবেন।
        </p>
      )
    },
    {
      id: 2,
      title: "২. ডিলার হওয়ার যোগ্যতা (Eligibility Criteria)",
      icon: Award,
      content: (
        <ul className="space-y-2.5 text-sm md:text-base text-muted-foreground list-disc pl-5">
          <li>আবেদনকারীকে অবশ্যই বাংলাদেশের নাগরিক হতে হবে।</li>
          <li>বৈধ জাতীয় পরিচয়পত্র (NID) থাকতে হবে।</li>
          <li>ব্যবসা পরিচালনার মানসিকতা ও আর্থিক সক্ষমতা থাকতে হবে।</li>
          <li>কৃষি বা প্রাণিসম্পদ খাতে অভিজ্ঞতা থাকলে অগ্রাধিকার দেওয়া হবে।</li>
          <li>সততা, সুনাম এবং ব্যবসায়িক নৈতিকতা বজায় রাখার অঙ্গীকার থাকতে হবে।</li>
        </ul>
      )
    },
    {
      id: 3,
      title: "৩. প্রয়োজনীয় কাগজপত্র (Required Documents)",
      icon: FileCheck,
      content: (
        <ul className="space-y-2 text-sm md:text-base text-muted-foreground list-disc pl-5">
          <li>জাতীয় পরিচয়পত্রের (NID) ফটোকপি</li>
          <li>২ কপি পাসপোর্ট সাইজের ছবি</li>
          <li>ট্রেড লাইসেন্স (Trade License) - যদি থাকে</li>
          <li>TIN সার্টিফিকেট (TIN Certificate) - যদি থাকে</li>
          <li>ব্যাংক হিসাবের তথ্য (Bank Account Details)</li>
          <li>বর্তমান ঠিকানার প্রমাণপত্র (Utility Bill/Certificate)</li>
          <li>সক্রিয় মোবাইল নম্বর ও ই-মেইল (যদি থাকে)</li>
        </ul>
      )
    },
    {
      id: 4,
      title: "৪. ডিলার সিকিউরিটি ও বিনিয়োগ (Security & Investment)",
      icon: DollarSign,
      content: (
        <ul className="space-y-2.5 text-sm md:text-base text-muted-foreground list-disc pl-5">
          <li>কোম্পানির নির্ধারিত সিকিউরিটি ডিপোজিট (Security Deposit) বা বিনিয়োগ জমা দিতে হবে।</li>
          <li>জমাকৃত অর্থের শর্তাবলী কোম্পানির নীতিমালা অনুযায়ী পরিচালিত হবে।</li>
          <li>ডিলারকে কোম্পানির নিয়ম অনুযায়ী নির্ধারিত সময়ে পণ্যের মূল্য সম্পূর্ণ পরিশোধ করতে হবে।</li>
        </ul>
      )
    },
    {
      id: 5,
      title: "৫. পণ্য বিক্রয় ও মূল্যনীতি (Sales & Pricing Policy)",
      icon: TrendingUp,
      content: (
        <ul className="space-y-2.5 text-sm md:text-base text-muted-foreground list-disc pl-5">
          <li>কোম্পানির নির্ধারিত খুচরা ও পাইকারি মূল্য তালিকা (Price List) কঠোরভাবে অনুসরণ করতে হবে।</li>
          <li>কোম্পানির অনুমোদন ছাড়া কোনো গ্রাহক বা খামারির থেকে অতিরিক্ত মূল্য আদায় করা যাবে না।</li>
          <li>নকল, ভেজাল বা নিম্নমানের কোনো পণ্য NB SAFA AGRO-এর ব্রান্ড নামে বিক্রি করা সম্পূর্ণ নিষিদ্ধ এবং আইনত দণ্ডনীয় অপরাধ।</li>
        </ul>
      )
    },
    {
      id: 6,
      title: "৬. অর্ডার ও ডেলিভারি নীতিমালা (Order & Delivery Policy)",
      icon: Truck,
      content: (
        <ul className="space-y-2.5 text-sm md:text-base text-muted-foreground list-disc pl-5">
          <li>অনলাইন বা অফলাইন অর্ডারের পর সর্বোচ্চ ৭২ ঘণ্টার মধ্যে পণ্য ডেলিভারির সর্বোচ্চ চেষ্টা করা হবে।</li>
          <li>প্রাকৃতিক দুর্যোগ, পরিবহন সংকট বা অন্য কোনো অনিবার্য কারণ দেখা দিলে গ্রাহক বা ডিলারকে যথাসময়ে অবহিত করা হবে।</li>
          <li>ডিলারকে সঠিকভাবে অর্ডার গ্রহণ ও খামারিদের কাছে সঠিক সময়ে পণ্য পৌঁছানো এবং উন্নত গ্রাহকসেবা নিশ্চিত করতে হবে।</li>
        </ul>
      )
    },
    {
      id: 7,
      title: "৭. ডিলারের দায়িত্ব (Responsibilities of a Dealer)",
      icon: Users,
      content: (
        <ul className="space-y-2.5 text-sm md:text-base text-muted-foreground list-disc pl-5">
          <li>নিজ নির্ধারিত এলাকার বাজার সম্প্রসারণ ও বিক্রয় বৃদ্ধি করা।</li>
          <li>নতুন গ্রাহক, ডিলার নেটওয়ার্ক এবং স্থানীয় খামারি তৈরি করা।</li>
          <li>কোম্পানির ভাবমূর্তি ও সুনাম বজায় রাখা।</li>
          <li>গ্রাহকদের সঠিক বৈজ্ঞানিক তথ্য, পণ্যের ব্যবহার বিধি ও প্রয়োজনীয় সেবা প্রদান করা।</li>
          <li>বিক্রয়-পরবর্তী যেকোনো প্রকার সহযোগিতা নিশ্চিত করা।</li>
        </ul>
      )
    },
    {
      id: 8,
      title: "৮. ব্র্যান্ডিং ও প্রচারণা (Branding & Promotion)",
      icon: ImageIcon,
      content: (
        <ul className="space-y-2.5 text-sm md:text-base text-muted-foreground list-disc pl-5">
          <li>কোম্পানির অনুমোদিত লোগো, সাইনবোর্ড, ব্যানার ও প্রচারণাসামগ্রী ব্যবহার করতে হবে।</li>
          <li>কোম্পানির লিখিত অনুমতি ব্যতীত কোনো বিভ্রান্তিকর বিজ্ঞাপন বা অসত্য তথ্য প্রচার করা যাবে না।</li>
        </ul>
      )
    },
    {
      id: 9,
      title: "৯. নিষিদ্ধ কার্যক্রম (Prohibited Activities)",
      icon: AlertTriangle,
      content: (
        <ul className="space-y-2.5 text-sm md:text-base text-muted-foreground list-disc pl-5 text-rose-950 dark:text-rose-200">
          <li>কোম্পানির নামে কোনো প্রকার প্রতারণা বা অর্থনৈতিক জালিয়াতি করা।</li>
          <li>ভেজাল, মেয়াদোত্তীর্ণ বা নকল পণ্য কোম্পানির প্যাকেটে বা নামে বিক্রি করা।</li>
          <li>কোম্পানির অনুমোদন ছাড়া অন্য কোনো ব্যক্তি বা প্রতিষ্ঠানের কাছে ডিলারশিপ হস্তান্তর করা।</li>
          <li>কোম্পানির ভাবমূর্তি বা সুনাম ক্ষুণ্ন করে এমন যেকোনো দেশবিরোধী বা অনৈতিক কর্মকাণ্ডে জড়িত থাকা।</li>
        </ul>
      )
    },
    {
      id: 10,
      title: "১০. ডিলারশিপ বাতিলের কারণ (Cancellation Grounds)",
      icon: ShieldCheck,
      content: (
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 p-4 rounded-xl space-y-2">
          <p className="text-sm font-semibold text-rose-950 dark:text-rose-300">নিম্নলিখিত ক্ষেত্রসমূহে কোম্পানি পূর্ব নোটিশ ছাড়াই ডিলারশিপ তাৎক্ষণিকভাবে বাতিল করতে পারবে:</p>
          <ul className="space-y-2 text-xs md:text-sm text-rose-900/90 dark:text-rose-300 list-disc pl-5">
            <li>চুক্তিপত্রের কোনো শর্ত ভঙ্গ করলে।</li>
            <li>প্রতারণা বা কোম্পানির অর্থ আত্মসাৎ করলে।</li>
            <li>ভেজাল বা নকল পণ্য কোম্পানির ব্র্যান্ড নামে বিক্রি করলে।</li>
            <li>কোম্পানির অফিশিয়াল নীতিমালা ও নির্দেশনা ক্রমাগত অমান্য করলে।</li>
            <li>কোম্পানির সুনাম ও ভাবমূর্তি গুরুতরভাবে ক্ষুণ্নকারী কোনো কার্যক্রমে জড়িত হলে।</li>
          </ul>
        </div>
      )
    },
    {
      id: 11,
      title: "১১. চুক্তির মেয়াদ (Agreement Duration)",
      icon: Calendar,
      content: (
        <ul className="space-y-2.5 text-sm md:text-base text-muted-foreground list-disc pl-5">
          <li>ডিলার নিয়োগ প্রাথমিকভাবে ১ (এক) বছরের জন্য কার্যকর থাকবে।</li>
          <li>ডিলারের বার্ষিক কর্মদক্ষতা, বিক্রয় লক্ষ্যমাত্রা অর্জন এবং নীতিমালার সঠিক অনুসরণের ভিত্তিতে চুক্তিপত্র নবায়ন করা হবে।</li>
        </ul>
      )
    },
    {
      id: 12,
      title: "১২. কোম্পানির অধিকার (Company's Rights)",
      icon: Settings,
      content: (
        <p className="leading-relaxed text-sm md:text-base text-muted-foreground">
          NB SAFA AGRO প্রয়োজন অনুযায়ী যেকোনো সময় এই নীতিমালার সংশোধন, সংযোজন, পরিমার্জন বা পরিবর্তন করার সর্বময় অধিকার সংরক্ষণ করে এবং সংশোধিত বা নতুন নীতিমালা সকল ডিলারের জন্য মেনে চলা বাধ্যতামূলক হবে।
        </p>
      )
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.id.toString().includes(searchQuery)
  );


  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 py-12 md:py-20 font-sans print:bg-white print:py-0">
      <div className="container mx-auto px-2 md:px-4 max-w-4xl">

        {/* Back Link & Action Buttons */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> হোমপেজে ফিরুন
          </Link>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs font-bold border-border hover:bg-muted"
          >
            <Download className="h-4 w-4" /> ডাউনলোড(PDF)
          </Button>
        </div>

        <div id="policy-content" className="bg-white px-3 py-6 md:p-10 rounded-2xl border border-zinc-100 print:border-none print:p-0">

          {/* Header Block */}
          <div className="text-center space-y-4 mb-12 border-b border-border/60 pb-8 print:border-b-2 print:border-zinc-800">
            <div className="flex justify-center items-center gap-3">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider print:border print:border-zinc-800">
                ডিলার নীতিমালা ও চুক্তিপত্র
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-foreground font-heading">
              NB SAFA AGRO
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
              বিসিক শিল্প নগরী, সপুরা, রাজশাহী, বাংলাদেশ
              <br />
              Email: nbsafaagro@gmail.com | Web: www.nbsafaagro.com
              <br />
              মোবাইল: ০১৭১১-৫৮৩৪২৪
            </p>
            <div className="mt-4 max-w-lg mx-auto bg-primary/5 dark:bg-primary/10 p-3 rounded-lg border border-primary/15 text-center text-xs font-medium text-primary">
              "বিশুদ্ধ কৃষি ও প্রাণিসম্পদ উন্নয়নের নির্ভরযোগ্য অংশীদার"
            </div>
          </div>

          {/* Interactive Accordion Section */}
          <div className="space-y-4 print:space-y-6">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;
              return (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 print:border-zinc-300 print:shadow-none"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 md:p-5 text-left font-bold text-sm md:text-base text-foreground hover:bg-muted/30 transition-colors print:pointer-events-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 print:border print:border-zinc-300">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span>{section.title}</span>
                    </div>
                    <div className="print:hidden">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  <div
                    className={`border-t border-border/50 p-4 md:p-5 bg-card/50 ${isExpanded ? 'block' : 'hidden'}`}
                  >
                    {section.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Declaration & Signature Form */}
          <div id="section-13" className="mt-12 p-4 md:p-8 bg-zinc-50 border border-border rounded-2xl space-y-6 md:space-y-8 print:bg-white print:border-zinc-400 print:mt-16">
            <div className="flex items-start gap-3">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-foreground">ঘোষণা (Declaration)</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  আমি ঘোষণা করছি যে, উপরে বর্ণিত ডিলার নিয়োগ ও পরিচালনা সংক্রান্ত সকল নীতিমালা ও শর্তাবলী অত্যন্ত মনোযোগ সহকারে পড়েছি এবং এর প্রতিটি ধারা সঠিকভাবে বুঝেছি। আমি এই নীতিমালা ও চুক্তিপত্রের সকল নিয়মকানুন ও বাধ্যবাধকতা পূর্ণাঙ্গভাবে মেনে ব্যবসা পরিচালনা করতে সজ্ঞানে সম্মত আছি।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs md:text-sm">
              <div className="space-y-3">
                <p className="border-b border-dashed border-zinc-400 pb-2">
                  <span className="font-bold text-muted-foreground mr-2">ডিলারের নাম:</span>
                </p>
                <p className="border-b border-dashed border-zinc-400 pb-2">
                  <span className="font-bold text-muted-foreground mr-2">প্রতিষ্ঠানের নাম:</span>
                </p>
                <p className="border-b border-dashed border-zinc-400 pb-2">
                  <span className="font-bold text-muted-foreground mr-2">ঠিকানা:</span>
                </p>
                <p className="border-b border-dashed border-zinc-400 pb-2">
                  <span className="font-bold text-muted-foreground mr-2">মোবাইল নম্বর:</span>
                </p>
              </div>
              <div className="flex flex-col justify-end space-y-6 md:items-end">
                <div className="border-t border-zinc-400 pt-2 w-full md:w-3/4 text-center">
                  <p className="font-bold text-foreground">ডিলারের স্বাক্ষর ও সিল</p>
                  <p className="text-xs text-muted-foreground mt-1">তারিখ: ____ / ____ / ________</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between gap-6 text-xs text-muted-foreground">
              <div>
                <p className="font-bold text-foreground">অনুমোদিত কর্তৃপক্ষ</p>
                <p className="mt-1">এনবি সাফা এগ্রো (NB SAFA AGRO)</p>
              </div>
              <div className="md:text-right">
                <p className="font-bold text-foreground">প্রতিষ্ঠাতা চেয়ারম্যান</p>
                <p className="mt-1">মো: জাহাঙ্গীর আলম</p>
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}
