"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText, ShieldCheck, Award, Briefcase, FileCheck, DollarSign,
  TrendingUp, Users, CheckCircle2, ChevronRight, ArrowLeft, Download,
  BookOpen, Star, Percent, Scale, RefreshCw, AlertTriangle, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'benefits' | 'dividend' | 'shares';

export default function DirectorPolicyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('benefits');

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/assets/director_policy_benefits.pdf';
    link.download = 'director_policy_benefits.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const benefits = [
    { id: 1, title: '১। সম্মান ও মর্যাদা', desc: 'প্রতিষ্ঠানের অফিশিয়াল ডিরেক্টর পরিচয়পত্র প্রদান, ভিজিটিং কার্ড ও অফিশিয়াল আইডি কার্ড। বিভিন্ন জাতীয় ও আন্তর্জাতিক সভা, সেমিনার ও গুরুত্বপূর্ণ অনুষ্ঠানে অগ্রাধিকার।' },
    { id: 2, title: '২। সিদ্ধান্ত গ্রহণে অংশগ্রহণ', desc: 'প্রতিষ্ঠানের গুরুত্বপূর্ণ নীতি নির্ধারণে মতামত প্রদান, বোর্ড মিটিংয়ে অংশগ্রহণ, দীর্ঘমেয়াদী উন্নয়ন পরিকল্পনা ও ভবিষ্যৎ লাভজনক প্রকল্পে সম্পৃক্ততা।' },
    { id: 3, title: '৩। আর্থিক সুবিধা', desc: 'বোর্ড অনুমোদিত ডিরেক্টর সম্মানী বা নিয়মিত পর্ষদ ভাতা, বিক্রয় বা বিশেষ অবদানের ওপর কমিশন/ইনসেনティブ, অফিশিয়াল সফর ব্যয় বহন এবং বাৎসরিক লভ্যাংশ অংশ।' },
    { id: 4, title: '৪। ব্যবসায়িক সুযোগ', desc: 'নতুন নতুন বৈশ্বিক ও দেশীয় ব্যবসায়িক নেটওয়ার্ক তৈরির সুযোগ, আধুনিক কৃষি ও প্রাণিসম্পদ খাতে নেতৃত্ব দেওয়ার ক্ষেত্র এবং ডিলার, এজেন্ট ও খামারি নেটওয়ার্ক সম্প্রসারণে অগ্রাধিকার।' },
    { id: 5, title: '৫। প্রশিক্ষণ ও দক্ষতা উন্নয়ন', desc: 'কোম্পানি আয়োজিত বিশেষ আন্তর্জাতিক ও দেশীয় প্রশিক্ষণ এবং কর্মশালায় অংশগ্রহণ, আধুনিক কৃষি ও বিজ্ঞানসম্মত প্রাণিসম্পদ ব্যবস্থাপনা এবং মার্কেটিং দক্ষতা উন্নয়ন।' },
    { id: 6, title: '৬। অফিশিয়াল সুবিধা', desc: 'প্রতিষ্ঠানের আধুনিক অফিস ও মিটিং স্পেস ব্যবহারের সুবিধা, অফিশিয়াল বিজনেস ডকুমেন্ট বা সুপারিশপত্র পাওয়ার সুযোগ এবং কোম্পানির লোগো/ব্র্যান্ড ব্যবহারের অনুমতি।' },
    { id: 7, title: '৭। সম্মাননা ও পুরস্কার', desc: 'সেরা পারফরম্যান্সের জন্য ক্রেস্ট, সনদ ও বিশেষ সম্মাননা, অনন্য অবদানের জন্য পদোন্নতি বা বোর্ড অব ডিরেক্টরের বিশেষ পদ লাভ এবং আন্তর্জাতিক প্রতিনিধি হওয়ার সুযোগ।' },
    { id: 8, title: '৮। সামাজিক মর্যাদা বৃদ্ধি', desc: 'সমাজে নেতৃত্ব ও গ্রহণযোগ্যতা বৃদ্ধি, সফল কৃষি উদ্যোক্তা হিসেবে ব্যবসায়িক পরিচিতি এবং কোম্পানির মাধ্যমে সামাজিক উন্নয়নমূলক কার্যক্রমে সম্পৃক্ততা।' },
    { id: 9, title: '৯। ভবিষ্যৎ অগ্রাধিকার', desc: 'প্রতিষ্ঠানের বড় প্রকল্প ও কলকারখানায় অগ্রাধিকার ভিত্তিতে সম্পৃক্ততা, নতুন সহযোগী শাখা বা ইউনিট পরিচালনার অগ্রাধিকার সুযোগ এবং দীর্ঘমেয়াদী ব্যবসায়িক অংশীদারিত্ব।' }
  ];

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
                পরিচালক নির্দেশিকা ও পলিসি
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
              "ডিরেক্টরদের উন্নয়ন ও সফলতায় ভূমিকা পালনের স্বীকৃতি হিসেবে ডিরেক্টরগণ নিয়োগের সুবিধাসমূহ ভোগ করবেন।"
            </div>
          </div>

          {/* Custom Premium Tabs switcher */}
          <div className="flex border-b border-border mb-8 print:hidden">
            {(['benefits', 'dividend', 'shares'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center text-xs md:text-sm font-bold border-b-2 transition-all ${activeTab === tab
                  ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab === 'benefits' && 'পরিচালকদের সুবিধাসমূহ'}
                {tab === 'dividend' && 'লভ্যাংশ বণ্টন নীতিমালা'}
                {tab === 'shares' && 'শেয়ার ও মনোনয়নের যোগ্যতা'}
              </button>
            ))}
          </div>

          {/* Content Tabs Area */}
          <div className="space-y-8">

            {/* Tab 1: Benefits */}
            <div className={`space-y-6 ${activeTab !== 'benefits' ? 'hidden' : ''}`}>
              <div className="flex items-center gap-2 border-b pb-3 border-border print:border-b-2 print:border-zinc-800">
                <Star className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-lg md:text-xl font-bold text-foreground">পরিচালকদের বিশেষ সুবিধাসমূহ (Director Benefits)</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 bg-card border border-border rounded-xl space-y-2 hover:border-primary/20 hover:shadow-sm transition-all duration-300 print:border-zinc-300 print:shadow-none"
                  >
                    <h3 className="font-bold text-sm md:text-base text-primary flex items-center gap-1.5">
                      <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                      {b.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl text-center text-xs italic text-muted-foreground print:bg-white print:border-zinc-300">
                "বিশেষ শর্ত: সকল সুবিধা প্রতিষ্ঠানের নীতিমালা ও বোর্ডের সিদ্ধান্ত অনুযায়ী প্রদান করা হবে। অনিয়ম, অসদাচরণ বা নীতিমালা ভঙ্গের ক্ষেত্রে সুবিধা স্থগিত বা বাতিল হতে পারে।"
              </div>
            </div>

            {/* Tab 2: Dividend Policy */}
            <div className={`space-y-6 ${activeTab !== 'dividend' ? 'hidden' : ''}`}>
              <div className="flex items-center gap-2 border-b pb-3 border-border print:border-b-2 print:border-zinc-800">
                <Percent className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-lg md:text-xl font-bold text-foreground">লভ্যাংশ বণ্টন নীতিমালা (Dividend Distribution Policy)</h2>
              </div>

              <div className="space-y-4">
                {/* Chapter 1 */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-3 print:border-zinc-300">
                  <h3 className="font-bold text-sm md:text-base text-foreground border-b pb-2 border-border/60">অধ্যায়-১: সাধারণ নীতিমালা</h3>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground list-disc pl-5">
                    <li>প্রতিষ্ঠানের সকল আয়-ব্যয় নিরীক্ষা ও হিসাব সম্পন্ন হওয়ার পর নিট মুনাফার (Net Profit) ভিত্তিতে লভ্যাংশ নির্ধারণ করা হবে।</li>
                    <li>লভ্যাংশ বণ্টনর পূর্বে নিম্নোক্ত বাধ্যতামূলক খাতে অর্থ সংরক্ষণ করা হবে:
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 font-semibold text-primary">
                        <span>• উৎপাদন ও পরিচালন ব্যয়</span>
                        <span>• কর্মকর্তা-কর্মচারীদের বেতন ও ভাতা</span>
                        <span>• ঋণ বা দেনা পরিশোধ</span>
                        <span>• জরুরি আপৎকালীন তহবিল</span>
                        <span>• ভবিষ্যৎ সম্প্রসারণ তহবিল</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Chapter 2 */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-3 print:border-zinc-300">
                  <h3 className="font-bold text-sm md:text-base text-foreground border-b pb-2 border-border/60">অধ্যায়-২: লভ্যাংশ বণ্টনের ভিত্তি</h3>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground list-disc pl-5">
                    <li><strong>বিনিয়োগের পরিমাণ:</strong> যিনি প্রতিষ্ঠানে বেশি মূলধন বিনিয়োগ করবেন, তিনি বিনিয়োগ অনুপাতে লভ্যাংশ পাওয়ার প্রধান অধিকারী হবেন।</li>
                    <li><strong>কর্মদক্ষতা ও অবদান:</strong> শুধু বিনিয়োগ নয়, প্রতিষ্ঠানের বিক্রয়, বাজার সম্প্রসারণ, উৎপাদন ও ব্যবস্থাপনায় বিশেষ অবদান রাখলে অতিরিক্ত ইনসেনティブ বা বোনাস প্রদান করা যেতে পারে।</li>
                    <li><strong>শেয়ার বা মালিকানা অংশ:</strong> প্রতিষ্ঠানের অনুমোদিত শেয়ার বা মালিকানা শতাংশ অনুযায়ী লাভ বণ্টন করা হবে।</li>
                  </ul>
                </div>

                {/* Chapter 3 & 4 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-xl p-5 space-y-3 print:border-zinc-300">
                    <h3 className="font-bold text-sm md:text-base text-foreground border-b pb-2 border-border/60">অধ্যায়-৩: লভ্যাংশ প্রদানের সময়</h3>
                    <ul className="space-y-2 text-xs md:text-sm text-muted-foreground list-disc pl-5">
                      <li>প্রতি অর্থবছর শেষে বোর্ড সভার অনুমোদনের মাধ্যমে লভ্যাংশ ঘোষণা ও প্রদান করা হবে।</li>
                      <li>প্রয়োজন ও পরিস্থিতি বিবেচনায় পরিচালনা পর্ষদ ৬ মাস অন্তর অন্তর্বর্তীকালীন লভ্যাংশ ঘোষণা করতে পারে।</li>
                    </ul>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-5 space-y-3 print:border-zinc-300">
                    <h3 className="font-bold text-sm md:text-base text-foreground border-b pb-2 border-border/60">অধ্যায়-৪: রিজার্ভ ও উন্নয়ন তহবিল</h3>
                    <p className="text-xs font-semibold text-foreground">প্রতিষ্ঠানের দীর্ঘমেয়াদী স্থায়িত্ব ও উন্নয়নের জন্য নিট মুনাফার একটি অংশ বাধ্যতামূলকভাবে সংরক্ষণ করা হবে:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground font-mono">
                      <div className="flex justify-between border-b pb-1"><span>রিজার্ভ ফান্ড:</span> <span className="font-bold text-primary">১০%</span></div>
                      <div className="flex justify-between border-b pb-1"><span>জরুরি তহবিল:</span> <span className="font-bold text-primary">৫%</span></div>
                      <div className="flex justify-between border-b pb-1"><span>সম্প্রসারণ তহবিল:</span> <span className="font-bold text-primary">১৫%</span></div>
                      <div className="flex justify-between border-b pb-1"><span>সামাজিক কার্যক্রম:</span> <span className="font-bold text-primary">২%</span></div>
                    </div>
                  </div>
                </div>

                {/* Chapter 5 & 6 */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-3 print:border-zinc-300">
                  <h3 className="font-bold text-sm md:text-base text-foreground border-b pb-2 border-border/60">অধ্যায়-৫: লভ্যাংশ স্থগিত বা বাতিলের কারণ</h3>
                  <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 p-3 rounded-lg text-xs md:text-sm text-rose-900/90 space-y-1">
                    <p className="font-semibold text-rose-950">নিম্নোক্ত কারণে বোর্ড লভ্যাংশ স্থগিত বা বাতিল করার অধিকার রাখে:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>প্রতিষ্ঠানের ব্যবসায়িক বা আর্থিক বড় ক্ষতি হলে।</li>
                      <li>কোনো ডিরেক্টরের বিরুদ্ধে আর্থিক অনিয়ম বা দুর্নীতির অভিযোগ প্রমাণিত হলে।</li>
                      <li>চুক্তিপত্রের কোনো গুরুত্বপূর্ণ ধারা বা কোম্পানির মূল নীতিমালা লংঘন করলে।</li>
                      <li>প্রতিষ্ঠানের সম্মিলিত স্বার্থবিরোধী ক্ষতিকর কোনো কার্যকলাপে লিপ্ত হলে।</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-3 print:border-zinc-300">
                  <h3 className="font-bold text-sm md:text-base text-foreground border-b pb-2 border-border/60">অধ্যায়-৬: স্বচ্ছতা ও নিরীক্ষণ</h3>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground list-disc pl-5">
                    <li>প্রতিষ্ঠানের সকল প্রকার হিসাব লিখিত ও ডিজিটাল মাধ্যমে স্বচ্ছভাবে সংরক্ষণ করতে হবে।</li>
                    <li>বোর্ড অনুমোদিত অডিট টিমের মাধ্যমে বাৎসরিক হিসাব নিরীক্ষা ও যাচাই করতে হবে।</li>
                    <li>লভ্যাংশ বণ্টনের বিস্তারিত প্রতিবেদন ও তথ্য সকল অংশীদার ও পরিচালকদের অবহিত করতে হবে।</li>
                  </ul>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-center text-xs md:text-sm font-semibold text-primary">
                    "স্বচ্ছতা, ন্যায়বিচার ও সম্মিলিত উন্নয়নের ভিত্তিতেই প্রকৃত লভ্যাংশ বণ্টন সম্ভব।"
                  </div>
                </div>
              </div>
            </div>

            {/* Tab 3: Share Ownership and Qualifications */}
            <div className={`space-y-6 ${activeTab !== 'shares' ? 'hidden' : ''}`}>
              <div className="flex items-center gap-2 border-b pb-3 border-border print:border-b-2 print:border-zinc-800">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-lg md:text-xl font-bold text-foreground">মনোনয়নের যোগ্যতা ও শেয়ার মালিকানা নীতিমালা (Director Share Policy)</h2>
              </div>

              {/* Share Rules Card */}
              <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4 print:border-zinc-400 print:bg-white print:p-0">
                <h3 className="font-bold text-base md:text-lg text-amber-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-600 shrink-0" />
                  শেয়ার মালিকানা সংক্রান্ত শর্তসমূহ
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="bg-card p-4 rounded-xl border border-border print:border-zinc-300">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">শেয়ারের ধরন</span>
                    <span className="text-sm md:text-base font-extrabold text-foreground">অনুমোদিত সাধারণ শেয়ার</span>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border print:border-zinc-300">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">প্রতি শেয়ারের মূল্য</span>
                    <span className="text-base md:text-lg font-black text-primary">১০০ টাকা</span>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border print:border-zinc-300">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">ন্যূনতম শেয়ার ও বিনিয়োগ</span>
                    <span className="text-base md:text-lg font-black text-primary">১,০০০ শেয়ার (১,০০,০০০ টাকা)</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed text-center">
                  * ...-এর ডিরেক্টর পদে মনোনয়ন বা নির্বাচনের জন্য অন্যতম প্রধান শর্ত হলো ন্যূনতম ১,০০০ শেয়ার বা ১,০০,০০০ (এক লক্ষ) টাকা বিনিয়োগ বাধ্যতামুলক।
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 space-y-3 print:border-zinc-300">
                  <h3 className="font-bold text-sm md:text-base text-foreground border-b pb-2 border-border/60">ডিরেক্টর পদে নির্বাচিত হওয়ার যোগ্যতা</h3>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground list-disc pl-5">
                    <li>প্রতিষ্ঠানের নীতিমালা, ব্যবসায়িক উদ্দেশ্য ও লক্ষ্য-উদ্দেশ্যের প্রতি স্থায়ীভাবে প্রতিশ্রুতিবদ্ধ হতে হবে।</li>
                    <li>সমাজে ও ব্যবসায়িক মহলে সততা, নেতৃত্ব এবং নৈতিক দায়িত্ববোধের ভালো রেকর্ড থাকতে হবে।</li>
                    <li>পর্ষদের উন্নয়ন ও ব্যবসায়িক সম্প্রসারণে সরাসরি সক্রিয় ভূমিকা পালনে আন্তরিক হতে হবে।</li>
                    <li>বোর্ড অব ডিরেক্টরের চূড়ান্ত অনুমোদন সাপেক্ষে ডিরেক্টর পদে মনোনীত বা নির্বাচিত হতে হবে।</li>
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-3 print:border-zinc-300">
                  <h3 className="font-bold text-sm md:text-base text-foreground border-b pb-2 border-border/60">ডিরেক্টরের প্রধান অধিকার ও দায়িত্ব</h3>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground list-disc pl-5">
                    <li>প্রতিষ্ঠানের নীতি নির্ধারণী বোর্ড সভায় অংশগ্রহণ ও ভোট প্রদান।</li>
                    <li>কোম্পানির ব্যবসায়িক পরিচালনা, সম্প্রসারণ ও ভবিষ্যৎ উন্নয়ন কার্যক্রমে গঠনমূলক মতামত বা পরামর্শ প্রদান।</li>
                    <li>প্রতিষ্ঠানের সম্মিলিত স্বার্থ সংরক্ষণ ও বাজারে কোম্পানির পরিচিতি বাড়াতে সক্রিয় ভূমিকা পালন।</li>
                    <li>কোম্পানির গঠনতন্ত্র, নীতিমালা এবং পর্ষদের সকল সিদ্ধান্ত যথাযথভাবে মেনে চলা।</li>
                  </ul>
                </div>
              </div>

              <div className="bg-zinc-50 border border-border rounded-xl p-4 md:p-5 space-y-2 print:bg-white print:border-zinc-400">
                <h4 className="font-bold text-sm text-foreground">গুরুত্বপূর্ণ ঘোষণা (Important Notice)</h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  NB SAFA AGRO-এর ১,০০০ (এক হাজার) সাধারণ শেয়ারের মালিকানা অর্জনের মাধ্যমে যেকোনো যোগ্য ব্যক্তি ডিরেক্টর পদের জন্য বিবেচিত হতে পারেন। তবে ডিরেক্টর পদে চূড়ান্ত মনোনয়ন, অধিকার ও পর্ষদ ভুক্তকরণ সম্পূর্ণভাবে পরিচালনা পর্ষদের সিদ্ধান্ত, কোম্পানির গঠনতন্ত্র এবং বোর্ডের প্রয়োজনীয় ছাড়পত্র সাপেক্ষে সম্পন্ন হবে।
                </p>
              </div>
            </div>

            {/* Footer signature line for print */}
            <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-6 text-xs text-muted-foreground">
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
