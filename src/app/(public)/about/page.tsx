"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target,
  Eye,
  Leaf,
  Sprout,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  GitMerge,
  BookOpen,
  Briefcase,
  Scale,
  Clock,
  HeartHandshake,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ClipboardList,
  UserCheck,
  BadgeAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const [expandedForm, setExpandedForm] = useState<number | null>(null);

  const toggleForm = (id: number) => {
    setExpandedForm(prev => prev === id ? null : id);
  };

  // Animation configurations
  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
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

  const commitments = [
    "উন্নতমানের ও নির্ভরযোগ্য কৃষি পণ্য সরবরাহ।",
    "কৃষক ও খামারিদের জন্য বাস্তবভিত্তিক প্রযুক্তিগত সহায়তা প্রদান।",
    "সৎ, স্বচ্ছ ও জবাবদিহিমূলক ব্যবসায়িক নীতি অনুসরণ।",
    "পরিবেশবান্ধব ও টেকসই কৃষি উন্নয়নে ভূমিকা রাখা।",
    "গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ অগ্রাধিকার দেওয়া।",
    "গবেষণা ও উদ্ভাবনের মাধ্যমে নতুন সম্ভাবনার দ্বার উন্মোচন।"
  ];

  const coreValues = [
    { title: "১. সততা ও স্বচ্ছতা", desc: "প্রতিটি ব্যবসায়িক কার্যক্রমে সততা, জবাবদিহিতা এবং স্বচ্ছতা বজায় রাখা।" },
    { title: "২. গুণগত মান", desc: "প্রতিটি পণ্য ও সেবার মান নিশ্চিত করতে কঠোর মান নিয়ন্ত্রণ ব্যবস্থা অনুসরণ করা।" },
    { title: "৩. গ্রাহক সন্তুষ্টি", desc: "গ্রাহকের চাহিদা, মতামত ও সন্তুষ্টিকে সর্বোচ্চ গুরুত্ব দিয়ে দ্রুত ও কার্যকর সেবা প্রদান করা।" },
    { title: "৪. দলগত কাজ", desc: "পারস্পরিক সম্মান, সহযোগিতা এবং সমন্বয়ের মাধ্যমে একটি দক্ষ ও ইতিবাচক কর্মপরিবেশ গড়ে তোলা।" },
    { title: "৫. উদ্ভাবন ও উন্নয়ন", desc: "নতুন প্রযুক্তি ও গবেষণাকে উৎসাহিত করে নিয়মিত উন্নয়নের সংস্কৃতি বজায় রাখা।" },
    { title: "৬. সময়ানুবর্তিতা", desc: "প্রতিশ্রুত সময়ের মধ্যে দায়িত্ব সম্পন্ন করা এবং পেশাদার আচরণ বজায় রাখা।" },
    { title: "৭. আইন ও নীতিමালার প্রতি শ্রদ্ধা", desc: "বাংলাদেশের প্রচলিত আইন, বিধিমালা এবং প্রতিষ্ঠানের অভ্যন্তরীণ নীতিমালা যথাযথভাবে অনুসরণ করা।" },
    { title: "৮. সামাজিক ও পরিবেশগত দায়বদ্ধতা", desc: "পরিবেশ সংরক্ষণ, নিরাপদ উৎপাদন এবং সমাজের কল্যাণে ইতিবাচক ভূমিকা পালন করা।" },
    { title: "৯. ধারাবাহিক শিক্ষা ও দক্ষতা বৃদ্ধি", desc: "কর্মীদের নিয়মিত প্রশিক্ষণ ও দক্ষতা উন্নয়নের মাধ্যমে প্রতিষ্ঠানের সক্ষমতা বৃদ্ধি করা।" },
    { title: "১০. উৎকর্ষের সাধনা", desc: "প্রতিটি কাজে সর্বোচ্চ মান অর্জনের জন্য নিরবচ্ছিন্ন প্রচেষ্টা চালিয়ে যাওয়া এবং ক্রমাগত উন্নয়নের সংস্কৃতি বজায় রাখা।" }
  ];

  const orgLayers = [
    {
      title: "১. চেয়ারম্যান / প্রতিষ্ঠাতা (Chairman / Founder)",
      duties: [
        "প্রতিষ্ঠানের দীর্ঘমেয়াদি নীতি ও কৌশল নির্ধারণ।",
        "বড় বিনিয়োগ ও গুরুত্বপূর্ণ সিদ্ধান্ত অনুমোদন।",
        "পরিচালনা পর্ষদের নেতৃত্ব প্রদান।",
        "প্রতিষ্ঠানের সামগ্রিক অগ্রগতি তদারকি।"
      ]
    },
    {
      title: "২. ব্যবস্থাপনা পরিচালক (Managing Director - MD)",
      duties: [
        "প্রতিষ্ঠানের সার্বিক কার্যক্রম পরিচালনা।",
        "সকল বিভাগের কার্যক্রম সমন্বয় করা।",
        "বার্ষিক বাজেট ও ব্যবসায়িক পরিকল্পনা অনুমোদন।",
        "কর্মক্ষমতা মূল্যায়ন ও কৌশলগত সিদ্ধান্ত গ্রহণ।"
      ]
    },
    {
      title: "৩. জেনারেল ম্যানেজার (General Manager - GM)",
      duties: [
        "দৈনন্দিন কার্যক্রম পরিচালনা।",
        "বিভিন্ন বিভাগের কাজ পর্যবেক্ষণ।",
        "GM-এর কাছে নিয়মিত অগ্রগতি প্রতিবেদন দাখিল।"
      ]
    }
  ];

  const departments = [
    {
      name: "(ক) অপারেশন বিভাগ",
      roles: [{ title: "অপারেশন ম্যানেজার", tasks: ["উৎপাদন পরিকল্পনা বাস্তবায়ন।", "মাঠ পর্যায়ের কার্যক্রম তদারকি।", "উৎপাদন দক্ষতা বৃদ্ধি।"] }]
    },
    {
      name: "(খ) সেলস ও মার্কেটিং বিভাগ",
      roles: [
        { title: "সেলস ম্যানেজার", tasks: ["বিক্রয় লক্ষ্যমাত্রা নির্ধারণ।", "এরিয়া ম্যানেজারদের তদারকি।", "বাজার বিশ্লেষণ ও নতুন কৌশল গ্রহণ।"] },
        { title: "এরিয়া ম্যানেজার", tasks: ["নিজস্ব এলাকার বিক্রয় কার্যক্রম পরিচালনা।", "সেলস এক্সিকিউটিভদের নিয়ন্ত্রণ ও প্রশিক্ষণ।", "সাপ্তাহিক রিপোর্ট জমা।"] },
        { title: "সেলস এক্সিকিউটিভ", tasks: ["গ্রাহক পরিদর্শন।", "অর্ডার সংগ্রহ।", "বকেয়া আদায়ে সহায়তা।", "দৈনিক রিপোর্ট প্রদান।"] }
      ]
    },
    {
      name: "(গ) ফাইন্যান্স ও অ্যাকাউন্টস বিভাগ",
      roles: [
        { title: "ফাইন্যান্স ম্যানেজার", tasks: ["আর্থিক পরিকল্পনা ও বাজেট নিয়ন্ত্রণ।", "ব্যাংক লেনদেন তদারকি।", "আর্থিক ঝুঁকি মূল্যায়ন।"] },
        { title: "অ্যাকাউন্টস অফিসার", tasks: ["ভাউচার প্রস্তুত।", "দৈনিক ক্যাশ মিল।", "হিসাব সংরক্ষণ।", "মাসিক আর্থিক প্রতিবেদন তৈরি।"] }
      ]
    },
    {
      name: "(ঘ) মানবসম্পদ (HR) বিভাগ",
      roles: [{ title: "HR ম্যানেজার", tasks: ["নিয়োগ কার্যক্রম পরিচালনা।", "প্রশিক্ষণ ও কর্মক্ষমতা মূল্যায়ন।", "শৃঙ্খলা ও কর্মপরিবেশ নিশ্চিত করা।"] }]
    },
    {
      name: "(ঙ) গুদাম ও স্টোর বিভাগ",
      roles: [{ title: "স্টোর ইনচার্জ", tasks: ["পণ্য গ্রহণ ও বিতরণ।", "স্টক রেজিস্টার সংরক্ষণ।", "মাসিক স্টক যাচাই।", "ক্ষয়ক্ষতি রিপোর্ট প্রস্তুত।"] }]
    },
    {
      name: "(চ) ক্রয় বিভাগ",
      roles: [{ title: "পারচেজ অফিসার", tasks: ["কোটেশন সংগ্রহ।", "ক্রয় আদেশ (Purchase Order) প্রস্তুত。 (সরবরাহকারীদের সাথে সমন্বয়।)", "নির্ধারিত মান নিশ্চিত করা।"] }]
    }
  ];

  const formsList = [
    {
      id: 1,
      title: "ফরম–১: চাকরির আবেদনপত্র (Job Application Form)",
      fields: ["আবেদনকারীর নাম", "পিতার নাম", "মাতার নাম", "জন্ম তারিখ", "জাতীয় পরিচয়পত্র নম্বর", "বর্তমান ঠিকানা", "স্থায়ী ঠিকানা", "মোবাইল নম্বর", "ই-মেইল", "শিক্ষাগত যোগ্যতা", "অভিজ্ঞতা", "আবেদনকৃত পদ", "স্বাক্ষর ও তারিখ"]
    },
    {
      id: 2,
      title: "ফরম–২: কর্মচারী তথ্য ফরম (Employee Information Form)",
      fields: ["কর্মচারী আইডি", "নাম", "পদবী", "বিভাগ", "যোগদানের তারিখ", "রক্তের গ্রুপ", "জরুরি যোগাযোগ", "ব্যাংক হিসাব নম্বর", "নমিনি তথ্য"]
    },
    {
      id: 3,
      title: "ফরম–৩: দৈনিক সেলস রিপোর্ট",
      fields: ["তারিখ", "সেলস এক্সিকিউটিভের নাম", "এলাকা", "মোট ভিজিট", "নতুন গ্রাহক", "মোট অর্ডার", "বিক্রয় মূল্য", "আদায়কৃত অর্থ", "বকেয়া", "মন্তব্য"]
    },
    {
      id: 4,
      title: "ফরম–৪: সাপ্তাহিক সেলস রিপোর্ট",
      fields: ["সপ্তাহ", "মোট বিক্রয়", "নতুন গ্রাহক", "নতুন ডিলার", "মোট আদায়", "সমস্যা", "আগামী সপ্তাহের পরিকল্পনা"]
    },
    {
      id: 5,
      title: "ফরম–৫: মাসিক বিক্রয় প্রতিবেদন",
      fields: ["মাস", "বিক্রয় লক্ষ্যমাত্রা", "অর্জিত বিক্রয়", "শতকরা অর্জন", "মোট আদায়", "বকেয়া", "মন্তব্য"]
    },
    {
      id: 6,
      title: "ফরম–৬: ডিলার আবেদনপত্র",
      fields: ["প্রতিষ্ঠানের নাম", "মালিকের নাম", "ঠিকানা", "মোবাইল নম্বর", "ট্রেড লাইসেন্স নম্বর", "TIN (যদি থাকে)", "ব্যাংক তথ্য", "গুদামের বিবরণ", "স্বাক্ষর"]
    },
    {
      id: 7,
      title: "ফরম–৭: Purchase Requisition (PR)",
      fields: ["PR নম্বর", "বিভাগ", "পণ্যের নাম", "পরিমাণ", "প্রয়োজনের কারণ", "আবেদনকারীর স্বাক্ষর", "বিভাগীয় প্রধানের অনুমোদন"]
    },
    {
      id: 8,
      title: "ফরম–৮: Purchase Order (PO)",
      fields: ["PO নম্বর", "সরবরাহকারীর নাম", "পণ্যের বিবরণ", "পরিমাণ", "একক মূল্য", "মোট মূল্য", "সরবরাহের তারিখ", "অনুমোদন"]
    },
    {
      id: 9,
      title: "ফরম–৯: Goods Received Note (GRN)",
      fields: ["GRN নম্বর", "তারিখ", "PO নম্বর", "সরবরাহকারীর নাম", "প্রাপ্ত পণ্য", "পরিমাণ", "মান যাচাই", "স্টোর ইনচার্জের স্বাক্ষর"]
    },
    {
      id: 10,
      title: "ফরম–১০: Goods Issue Note (GIN)",
      fields: ["GIN নম্বর", "তারিখ", "বিভাগ", "পণ্যের নাম", "পরিমাণ", "গ্রহণকারীর স্বাক্ষর", "স্টোর ইনচার্জের স্বাক্ষর"]
    },
    {
      id: 11,
      title: "ফরম–১১: স্টক রেজিস্টার",
      fields: ["পণ্যের নাম", "কোড", "উদ্বৃত্ত স্টক", "প্রাপ্তি", "বিতরণ", "বর্তমান স্টক", "মন্তব্য"]
    },
    {
      id: 12,
      title: "ফরম–১২: ক্যাশ ভাউচার",
      fields: ["ভাউচার নম্বর", "তারিখ", "অর্থ গ্রহণ/প্রদান", "বিবরণ", "পরিমাণ", "সংযুক্ত বিল", "অনুমোদন"]
    },
    {
      id: 13,
      title: "ফরম–১৩: উপস্থিতি রেজিস্টার",
      fields: ["কর্মচারীর নাম", "আইডি", "তারিখ", "প্রবেশ সময়", "প্রস্থান সময়", "স্বাক্ষর"]
    },
    {
      id: 14,
      title: "ফরম–১৪: ছুটির আবেদনপত্র",
      fields: ["কর্মচারীর নাম", "পদবী", "ছুটির ধরন", "ছুটির সময়কাল", "कारण", "আবেদনকারীর স্বাক্ষর", "অনুমোদন"]
    },
    {
      id: 15,
      title: "ফরম–১৫: কর্মক্ষমতা মূল্যায়ন (KPI Form)",
      fields: ["কর্মচারীর নাম", "বিভাগ", "মূল্যায়নের সময়কাল", "KPI স্কোর", "সুপারভাইজারের মন্তব্য", "চূড়ান্ত মূল্যায়ন"]
    },
    {
      id: 16,
      title: "ফরম–১৬: অভিযোগ ফরম (Complaint Form)",
      fields: ["অভিযোগকারীর নাম", "তারিখ", "অভিযোগের বিষয়", "বিস্তারিত বিবরণ", "প্রস্তাবিত সমাধান", "তদন্ত কর্মকর্তার মন্তব্য"]
    },
    {
      id: 17,
      title: "ফরম–১৭: দুর্ঘটনা/ঘটনা রিপোর্ট (Incident Report)",
      fields: ["ঘটনার তারিখ", "স্থান", "সংশ্লিষ্ট ব্যক্তি", "ঘটনার বিবরণ", "ক্ষয়ক্ষতি", "তাৎক্ষণিক ব্যবস্থা", "সুপারিশ"]
    },
    {
      id: 18,
      title: "ফরম–১৮: সম্পদ নিবন্ধন (Asset Register)",
      fields: ["সম্পদের নাম", "কোড", "ক্রয়ের তারিখ", "মূল্য", "অবস্থান", "দায়িত্বপ্রাপ্ত ব্যক্তি"]
    },
    {
      id: 19,
      title: "ফরম–১৯: ভিজিট রিপোর্ট",
      fields: ["কর্মকর্তার নাম", "ভিজিটের স্থান", "তারিখ", "উদ্দেশ্য", "পর্যবেক্ষণ", "সুপারিশ"]
    },
    {
      id: 20,
      title: "ফরম–২০: মাসিক ব্যবস্থাপনা সারসংক্ষেপ",
      fields: ["মোট বিক্রয়", "মোট উৎপাদন", "মোট আদায়", "মোট ব্যয়", "স্টক অবস্থা", "প্রধান সাফল্য", "প্রধান সমস্যা", "পরবর্তী মাসের কর্মপরিকল্পনা"]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground">

      {/* Hero Header */}
      <section className="relative bg-card text-card-foreground border-b border-border py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background opacity-60 pointer-events-none" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center space-y-6 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight leading-none text-foreground font-heading"
          >
            এনবি সাফা এগ্রো <span className="text-primary">(NB SAFA AGRO)</span>
          </motion.h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">অপারেশনাল এবং স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর (SOP) ম্যানুয়াল</p>
        </div>
      </section>

      {/* 1. INTRODUCTION SECTION */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-foreground font-heading border-b border-border pb-3">প্রতিষ্ঠানের পরিচিতি</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              এনবি সাফা এগ্রো একটি আধুনিক কৃষি ও প্রাণিসম্পদভিত্তিক প্রতিষ্ঠান, যার মূল লক্ষ্য দেশের কৃষক, খামারি এবং উদ্যোক্তাদের জন্য উন্নতমানের পণ্য ও সেবা প্রদান করা। প্রতিষ্ঠানটি কৃষি ও প্রাণিসম্পদ খাতের টেকসই উন্নয়ন, উৎপাদনশীলতা বৃদ্ধি এবং প্রযুক্তিনির্ভর ব্যবস্থাপনার মাধ্যমে দেশের খাদ্য নিরাপত্তা ও অর্থনৈতিক প্রবৃদ্ধিতে অবদান রাখার লক্ষ্যে কাজ করে।
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              এনবি সাফা এগ্রো সঠিক সময়ে সঠিক প্রযুক্তি ব্যবহারের মাধ্যমে উচ্চমানের ভুট্টা চাষ, সাইলেজ উৎপাদন, গবাদিপশুর পুষ্টি উন্নয়ন এবং কৃষিভিত্তিক বিভিন্ন উদ্ভাবনী কার্যক্রম পরিচালনা করে। প্রতিষ্ঠানের প্রতিটি পণ্য ও সেবা মান, নিরাপত্তা এবং গ্রাহকের আস্থাকে সর্বোচ্চ গুরুত্ব দিয়ে উন্নয়ন ও বাজারজাত করা হয়।
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              আমাদের বিশ্বাস, একটি সফল কৃষি ব্যবস্থার ভিত্তি হলো উন্নত প্রযুক্তি, বৈজ্ঞানিক ব্যবস্থাপনা এবং কৃষকের সাথে দীর্ঘমেয়াদি অংশীদারিত্ব। সেই লক্ষ্যকে সামনে রেখে এনবি সাফা এগ্রো মাঠ পর্যায়ে প্রশিক্ষণ, প্রযুক্তিগত পরামর্শ, বিক্রয়োত্তর সেবা এবং নিরবচ্ছিন্ন গ্রাহক সহায়তা প্রদান করে।
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-6 md:p-8 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <HeartHandshake className="h-6 w-6" />
              <h3 className="text-lg font-bold">আমাদের অঙ্গীকার</h3>
            </div>
            <ul className="grid md:grid-cols-2 gap-4">
              {commitments.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. GOAL, VISION & MISSION */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-foreground font-heading">আমাদের লক্ষ্য (Goal)</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              বাংলাদেশের কৃষি ও প্রাণিসম্পদ খাতে একটি বিশ্বস্ত, আধুনিক ও আন্তর্জাতিক মানসম্পন্ন প্রতিষ্ঠান হিসেবে প্রতিষ্ঠিত হওয়া।
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Eye className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-extrabold text-foreground">ভিশন (Vision)</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                বাংলাদেশের কৃষি ও প্রাণিসম্পদ খাতে একটি বিশ্বস্ত, উদ্ভাবনী ও আন্তর্জাতিক মানসম্পন্ন প্রতিষ্ঠান হিসেবে প্রতিষ্ঠিত হওয়া, যা আধুনিক প্রযুক্তি, টেকসই উৎপাদন ব্যবস্থা এবং মানসম্মত সেবার মাধ্যমে কৃষক, খামারি ও উদ্যোক্তাদের জীবনমান উন্নয়নে গুরুত্বপূর্ণ ভূমিকা পালন করবে।
              </p>
            </div>

            <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Target className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-extrabold text-foreground">মিশন (Mission)</h3>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground list-decimal pl-4">
                <li>কৃষি ও প্রাণিসম্পদ খাতে উচ্চমানসম্পন্ন, নিরাপদ ও কার্যকর পণ্য ও সেবা সরবরাহ করা।</li>
                <li>আধুনিক প্রযুক্তি, গবেষণা ও উদ্ভাবনের মাধ্যমে উৎপাদনশীলতা বৃদ্ধি এবং কৃষকদের জন্য টেকসই সমাধান নিশ্চিত করা।</li>
                <li>গ্রাহক, ডিলার ও ব্যবসায়িক অংশীদারদের সঙ্গে দীর্ঘমেয়াদি আস্থাভিত্তিক সম্পর্ক গড়ে তোলা।</li>
                <li>দক্ষ জনবল, সুশাসন এবং স্বচ্ছ ব্যবস্থাপনার মাধ্যমে প্রতিষ্ঠানের ধারাবাহিক উন্নয়ন নিশ্চিত করা।</li>
                <li>পরিবেশবান্ধব ও সামাজিকভাবে দায়িত্বশীল ব্যবসায়িক কার্যক্রম পরিচালনার মাধ্যমে দেশের অর্থনৈতিক উন্নয়নে অবদান রাখা।</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl space-y-6">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-heading border-b border-border pb-3">মূলনীতি (Core Values)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {coreValues.map((val, idx) => (
              <div key={idx} className="bg-card border border-border p-4 rounded-xl hover:border-primary/20 transition-all duration-200">
                <h3 className="text-xs md:text-sm font-bold text-primary mb-1.5">{val.title}</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ORGANIZATIONAL STRUCTURE */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-foreground font-heading">সাংগঠনিক কাঠামো (Organizational Structure)</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              প্রতিষ্ঠানের কার্যক্রম সুষ্ঠু, স্বচ্ছ এবং জবাবদিহিমূলকভাবে পরিচালনার জন্য একটি সুসংগঠিত সাংগঠনিক কাঠামো অনুসরণ করা হবে। প্রত্যেক কর্মকর্তা ও কর্মচারী তার নির্ধারিত দায়িত্ব, কর্তৃত্ব এবং রিপোর্টিং লাইনের আওতায় কাজ করবেন।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {orgLayers.map((layer, idx) => (
              <div key={idx} className="bg-card border border-border p-6 rounded-xl hover:shadow-md transition-all duration-300">
                <h4 className="text-base font-extrabold text-primary mb-4 font-heading">{layer.title}</h4>
                <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                  {layer.duties.map((d, dIdx) => (
                    <li key={dIdx}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Reporting line tree flow */}
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-6 text-center flex items-center justify-center gap-1.5">
              <GitMerge className="h-4.5 w-4.5 text-primary" /> রিপোর্টিং লাইন (Reporting Lines)
            </h3>
            <div className="flex flex-col items-center space-y-3 max-w-sm mx-auto">
              <div className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-lg text-xs border border-primary/20 text-center w-full">চেয়ারম্যান (Chairman)</div>
              <div className="h-3 w-0.5 bg-primary/30" />
              <div className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-lg text-xs border border-primary/20 text-center w-full">ব্যবস্থাপনা পরিচালক (MD)</div>
              <div className="h-3 w-0.5 bg-primary/30" />
              <div className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-lg text-xs border border-primary/20 text-center w-full">জেনারেল ম্যানেজার (GM)</div>
              <div className="h-3 w-0.5 bg-primary/30" />
              <div className="bg-card border border-border text-foreground font-semibold px-4 py-1.5 rounded-lg text-[11px] text-center w-full">বিভাগীয় ম্যানেজারগণ (অপারেশন | সেলস | ফাইন্যান্স | HR | স্টোর | পারচেজ)</div>
              <div className="h-3 w-0.5 bg-primary/30" />
              <div className="bg-card border border-border text-muted-foreground px-4 py-1.5 rounded-lg text-[10px] text-center w-full">এরিয়া ম্যানেজার / সুপারভাইজার</div>
              <div className="h-3 w-0.5 bg-primary/30" />
              <div className="bg-card border border-border text-muted-foreground px-4 py-1.5 rounded-lg text-[10px] text-center w-full">সেলস এক্সিকিউটিভ / মাঠকর্মী / অফিস স্টাফ</div>
            </div>
            <div className="mt-6 text-center text-xs text-muted-foreground max-w-xl mx-auto italic">
              * মূল নীতি: প্রত্যেক কর্মকর্তা শুধুমাত্র তার ঊর্ধ্বতন কর্মকর্তার কাছে জবাবদিহি করবেন। লিখিত অনুমোদন ছাড়া দায়িত্বের বাইরে কোনো আর্থিক বা প্রশাসনিক সিদ্ধান্ত গ্রহণ করা যাবে না।
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="space-y-6">
            <h4 className="text-base font-extrabold text-foreground mb-4 font-heading text-center">বিভাগীয় বিস্তারিত কাঠামো</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-5 space-y-4 hover:border-primary/20 transition-all duration-300">
                  <h5 className="font-extrabold text-sm text-foreground border-b border-border pb-2 text-primary font-heading">{dept.name}</h5>
                  <div className="space-y-3">
                    {dept.roles.map((role, rIdx) => (
                      <div key={rIdx} className="space-y-1">
                        <span className="text-xs font-bold text-foreground block">{role.title}</span>
                        <ul className="list-disc pl-4 text-[11px] text-muted-foreground space-y-1">
                          {role.tasks.map((task, tIdx) => (
                            <li key={tIdx}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CHAPTER 4: ROLES AND RESPONSIBILITIES */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-heading border-b border-border pb-3">অধ্যায় ৪: দায়িত্ব ও कर्तव्य (Roles and Responsibilities)</h2>

          <div className="grid sm:grid-cols-2 gap-6 text-xs md:text-sm text-muted-foreground">
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">১. চেয়ারম্যান / প্রতিষ্ঠাতা</strong>
              <p><strong>দায়িত্ব:</strong> প্রতিষ্ঠানের দীর্ঘমেয়াদি লক্ষ্য, ভিশন ও কৌশল নির্ধারণ। গুরুত্বপূর্ণ বিনিয়োগ ও নীতিগত সিদ্ধান্ত অনুমোদন। পরিচালনা পর্ষদ ও উচ্চপর্যায়ের ব্যবস্থাপনার সামগ্রিক কার্যক্রম মূল্যায়ন ও তদারকি।</p>
              <p><strong>কর্তব্য:</strong> প্রতিষ্ঠানের সুনাম ও নৈতিক মান বজায় রাখা। স্বচ্ছতা ও জবাবদিহিতা নিশ্চিত করা এবং টেকসই উন্নয়নে কার্যকর দিকনির্দেশনা প্রদান।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">২. ব্যবস্থাপনা পরিচালক (Managing Director)</strong>
              <p><strong>দায়িত্ব:</strong> প্রতিষ্ঠানের সার্বিক কার্যক্রম পরিচালনা ও নিয়ন্ত্রণ। বার্ষিক ব্যবসায়িক পরিকল্পনা ও বাজেট অনুমোদন। বিভাগীয় প্রধানদের কার্যক্রম তদারকি এবং গুরুত্বপূর্ণ চুক্তি গ্রহণ।</p>
              <p><strong>কর্তব্য:</strong> প্রতিষ্ঠানের লক্ষ্য অর্জনে নেতৃত্ব প্রদান, নিয়মিত কর্মক্ষমতা মূল্যায়ন করা এবং দেশের প্রচলিত আইন ও নীতিমালা অনুসরণ নিশ্চিত করা।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">৩. জেনারেল ম্যানেজার (General Manager)</strong>
              <p><strong>দায়িত্ব:</strong> দৈনন্দিন কার্যক্রম সমন্বয় ও বাস্তবায়ন। বিভাগসমূহের মধ্যে সমন্বয় বজায় রাখা। মাসিক ও ত্রৈমাসিক অগ্রগতি পর্যালোচনা এবং সমস্যা শনাক্ত করে দ্রুত সমাধানের উদ্যোগ নেওয়া।</p>
              <p><strong>কর্তব্য:</strong> নির্ধারিত লক্ষ্যমাত্রা বাস্তবায়ন নিশ্চিত করা ও সময়মতো ব্যবস্থাপনা পরিচালককে প্রতিবেদন প্রদান।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">৪. সেলস ম্যানেজার</strong>
              <p><strong>দায়িত্ব:</strong> বিক্রয় পরিকল্পনা ও টার্গেট নির্ধারণ। এরিয়া ম্যানেজার ও সেলস টিম পরিচালনা। বাজার বিশ্লেষণ ও প্রতিযোগী মূল্যায়ন।</p>
              <p><strong>কর্তব্য:</strong> বিক্রয় বৃদ্ধি নিশ্চিত করা এবং ডিলার ও গ্রাহকদের সাথে সুসম্পর্ক বজায় রাখা।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">৫. এরিয়া ম্যানেজার</strong>
              <p><strong>দায়িত্ব:</strong> নির্ধারিত এলাকার বিক্রয় কার্যক্রম পরিচালনা। সেলস এক্সিকিউটিভদের কাজ পর্যবেক্ষণ এবং মাসিক বিক্রয় প্রতিবেদন প্রস্তুত।</p>
              <p><strong>কর্তব্য:</strong> এলাকার বিক্রয় লক্ষ্যমাত্রা অর্জন এবং নতুন বাজার ও ডিলার তৈরি করা।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">৬. সেলস এক্সিকিউটিভ</strong>
              <p><strong>দায়িত্ব:</strong> প্রতিদিন নির্ধারিত এলাকায় গ্রাহক পরিদর্শন, অর্ডার সংগ্রহ, বিক্রয় বৃদ্ধি ও বকেয়া আদায়ে সহায়তা। নতুন গ্রাহক ও ডিলার সংগ্রহ এবং দৈনিক কাজের রিপোর্ট জমা।</p>
              <p><strong>কর্তব্য:</strong> প্রতিষ্ঠানের ভাবমূর্তি বজায় রাখা, গ্রাহকের আস্থা অর্জন ও সময়মতো অফিসে রিপোর্ট দাখিল করা।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">৭. ফাইন্যান্স ও অ্যাকাউন্টস ম্যানেজার</strong>
              <p><strong>দায়িত্ব:</strong> আর্থিক পরিকল্পনা ও বাজেট প্রণয়ন। ব্যাংক লেনদেন ও নগদ প্রবাহ তদারকি। মাসিক আর্থিক বিবরণী প্রস্তুত করা।</p>
              <p><strong>কর্তব্য:</strong> সঠিক হিসাব সংরক্ষণ, আর্থিক অনিয়ম প্রতিরোধ করা এবং অডিটে সহযোগিতা করা।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">৮. অ্যাকাউন্টস অফিসার</strong>
              <p><strong>দায়িত্ব:</strong> দৈনিক আয়-ব্যয়ের হিসাব সংরক্ষণ, ভাউচার ও বিল যাচাই, ক্যাশ বুক ও লেজার হালনাগাদ রাখা।</p>
              <p><strong>কর্তব্য:</strong> সময়মতো আর্থিক রিপোর্ট প্রস্তুত করা এবং নথিপত্র নিরাপদে সংরক্ষণ করা।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">৯. স্টোর ইনচার্জ</strong>
              <p><strong>দায়িত্ব:</strong> পণ্য গ্রহণ, সংরক্ষণ ও বিতরণ। স্টক রেজিস্টার ও ক্ষয়ক্ষতি রিপোর্ট প্রস্তুত এবং স্টক যাচাই।</p>
              <p><strong>কর্তব্য:</strong> স্টকের সঠিকতা নিশ্চিত করা এবং ক্ষয়ক্ষতি বা ঘাটতি দ্রুত রিপোর্ট করা।</p>
            </div>
            <div className="bg-card border border-border/60 p-5 rounded-xl space-y-2">
              <strong className="text-foreground block font-bold text-sm">১০. মানবসম্পদ (HR) ম্যানেজার</strong>
              <p><strong>দায়িত্ব:</strong> জনবল নিয়োগ ও প্রশিক্ষণ। উপস্থিতি ও ছুটির রেকর্ড সংরক্ষণ। কর্মক্ষমতা মূল্যায়ন পরিচালনা।</p>
              <p><strong>কর্তব্য:</strong> কর্মীদের জন্য ইতিবাচক কর্মপরিবেশ নিশ্চিত করা এবং শৃঙ্খলা ও আচরণবিধি বাস্তবায়ন করা।</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/15 p-4 rounded-xl text-xs text-muted-foreground mt-4">
            <strong className="text-foreground block mb-1">সাধারণ কর্তব্য (সকল কর্মকর্তা ও কর্মচারীর জন্য):</strong>
            প্রতিষ্ঠানের নীতিমালা ও আইন মেনে চলা। সততা, নিষ্ঠা ও পেশাদারিত্বের সাথে দায়িত্ব পালন করা। অফিসের গোপনীয় তথ্য সংরক্ষণ করা। সময়মতো নির্ধারিত কাজ সম্পন্ন করা এবং প্রতিষ্ঠানের সম্পদ ও সুনাম রক্ষায় সর্বোচ্চ দায়িত্বশীলতা প্রদর্শন করা।
          </div>
        </div>
      </section>

      {/* 6. CHAPTER 5: HR POLICY */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-heading">অধ্যায় ৫: মানবসম্পদ (HR) ও এইচআর নীতিমালা</h2>

          <div className="grid md:grid-cols-2 gap-6 text-xs md:text-sm text-muted-foreground">
            <div className="space-y-3">
              <span className="font-bold text-foreground block">৫.১ ভূমিকা ও উদ্দেশ্য:</span>
              <p className="leading-relaxed">মানবসম্পদ (HR) হলো প্রতিষ্ঠানের সবচেয়ে মূল্যবান সম্পদ। দক্ষ, সৎ ও দায়িত্বশীল জনবল নিয়োগ, উন্নয়ন এবং ধরে রাখার মাধ্যমে প্রতিষ্ঠানের লক্ষ্য অর্জন করা এবং নিরাপদ ও ইতিবাচক কর্মপরিবেশ নিশ্চিত করা এই নীতিমালার মূল উদ্দেশ্য।</p>
            </div>
            <div className="space-y-3">
              <span className="font-bold text-foreground block">৫.৩ নিয়োগ নীতিমালা & ডকুমেন্টস:</span>
              <p>বিভাগের চাহিদার ভিত্তিতে নিয়োগ। প্রয়োজনীয় নথিপত্র: জাতীয় পরিচয়পত্র (NID), শিক্ষাগত ও অভিজ্ঞতার সনদপত্র, পাসপোর্ট সাইজের ছবি এবং জীবনবৃত্তান্ত (CV)।</p>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <span className="font-bold text-foreground block">৫.৪ প্রবেশন (Probation) মেয়াদ:</span>
              <p>নতুন নিয়োগপ্রাপ্ত কর্মীর প্রবেশনকাল সাধারণত ৩ থেকে ৬ মাস। প্রবেশনকাল সফলভাবে শেষ করার পর সন্তোষজনক কর্মদক্ষতার ভিত্তিতে স্থায়ী নিয়োগ প্রদান করা হবে।</p>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <span className="font-bold text-foreground block">৫.৫ কর্মঘণ্টা ও উপস্থিতি:</span>
              <p>অফিস সময় সকাল ৯:০০ টা থেকে বিকেল ৬:০০ টা (১ ঘণ্টা মধ্যাহ্ন বিরতিসহ)। বায়োমেট্রিক বা উপস্থিতি রেজিস্টারে উপস্থিতি নিশ্চিত করতে হবে। অননুমোদিত অনুপস্থিতি শৃঙ্খলাভঙ্গ হিসেবে গণ্য হবে।</p>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <span className="font-bold text-foreground block">৫.৭ ছুটির নীতিমালা:</span>
              <p>সরকারি ছুটির তালিকা অনুযায়ী সাধারণ ছুটি। এছাড়া বছরে নির্ধারিত নৈমিত্তিক ছুটি, চিকিৎসকের সনদ সাপেক্ষে অসুস্থতাজনিত ছুটি এবং মেয়াদের ওপর ভিত্তি করে অনুমোদিত বার্ষিক ছুটি প্রদান করা হবে।</p>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <span className="font-bold text-foreground block">৫.৮ বেতন, ভাতা ও মূল্যায়ন:</span>
              <p>প্রতি মাসে নির্ধারিত সময়ে ব্যাংক বা মোবাইল ফিন্যান্সিয়াল সার্ভিসের মাধ্যমে বেতন প্রদান। কাজের লক্ষ্য অর্জন, সময়ানুবর্তিতা এবং শৃঙ্খলার ওপর ভিত্তি করে নিয়মিত KPI মূল্যায়ন করা হবে।</p>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <span className="font-bold text-foreground block">৫.১১ আচরণবিধি & গোপনীয়তা:</span>
              <p>সততা বজায় রাখা, গ্রাহক ও সহকর্মীদের প্রতি ভদ্র আচরণ ও অফিসের ব্যবসায়িক তথ্য গোপন রাখা বাধ্যতামূলাক। কোনো প্রকার ঘুষ, দুর্নীতি বা প্রতারণায় জড়ানো যাবে না।</p>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <span className="font-bold text-foreground block">৫.১৩ পদত্যাগ ও সমান সুযোগ:</span>
              <p>স্থায়ী কর্মচারীকে কমপক্ষে ৩০ দিন পূর্বে লিখিত নোটিশ প্রদান করতে হবে এবং সকল দায়িত্ব ও সম্পদ বুঝিয়ে চূড়ান্ত নিষ্পত্তি সম্পন্ন করতে হবে। যোগ্যতা, দক্ষতা ও কর্মদক্ষতার ভিত্তিতে সকল প্রার্থী ও কর্মচারীকে সমান সুযোগ প্রদান করা হবে।</p>
            </div>
          </div>

          <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 border border-rose-100 dark:border-rose-900 rounded-xl space-y-2 text-rose-950 dark:text-rose-200 text-xs">
            <strong className="block flex items-center gap-1.5 text-rose-600"><ShieldAlert className="h-4.5 w-4.5" /> ৫.১২ শৃঙ্খলামূলক ব্যবস্থা:</strong>
            <p>দেরি উপস্থিতি, অননুমোদিত অনুপস্থিতি, অসদাচরণ, আর্থিক অনিয়ম বা তথ্য ফাঁসের ক্ষেত্রে শাস্তিমূলক পদক্ষেপ: ১. মৌখিক সতর্কতা, ২. লিখিত নোটিশ, ৩. কারণ দর্শানোর নোটিশ, ৪. সাময়িক বরখাস্ত এবং ৫. চাকরি বাতিল।</p>
          </div>
        </div>
      </section>

      {/* 7. CHAPTER 6: SALES SOP */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-heading border-b border-border pb-3">অধ্যায় ৬: সেলস অ্যান্ড মার্কেটিং স্ট্যান্ডার্ড Operating Procedure (SOP)</h2>

          <div className="space-y-4 text-xs md:text-sm text-muted-foreground">
            <div>
              <span className="font-bold text-foreground block mb-2 text-sm">৬.৪ দৈনিক কার্যক্রম (Daily Routine):</span>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>সকাল ৮:৩০ মিনিটে অনলাইন বা অফিস ব্রিফিংয়ে অংশগ্রহণ।</li>
                <li>নির্ধারিত রুট প্ল্যান অনুযায়ী মাঠ পরিদর্শন (দৈনিক কমপক্ষে ১০টি দোকান, ডিলার বা খামার ভিজিট)।</li>
                <li>কমপক্ষে ২০ জন সম্ভাব্য গ্রাহক বা খামারির সাথে যোগাযোগ স্থাপন।</li>
                <li>নতুন অর্ডার সংগ্রহ, বকেয়া আদায়ের ফলো-আপ ও প্রতিযোগী প্রতিষ্ঠানের বাজার তথ্য সংগ্রহ।</li>
                <li>দিনের শেষে প্রতিদিনের কাজের রিপোর্ট জমা দেওয়া।</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <span className="font-bold text-foreground block">সাপ্তাহিক ও মাসিক দায়িত্ব:</span>
                <p>বিক্রয় অগ্রগতি পর্যালোচনা করা, ডিলারদের সাথে সমন্বয় সভা, নতুন সম্ভাব্য বাজার চিহ্নিতকরণ, KPI মূল্যায়ন এবং নতুন ডিলার অনুমোদনের সুপারিশ দাখিল।</p>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-foreground block">৬.১০ মার্কেটিং ও প্রচার:</span>
                <p>ডিজিটাল মার্কেটিং পরিচালনা, কৃষক ও খামারিদের জন্য সেমিনার ও পণ্য প্রদর্শনী আয়োজন করা। সেই সাথে ব্যানার, প্রচারপত্র ও পোস্টার বিতরণ করা।</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <span className="font-bold text-foreground block">গ্রাহক ব্যবস্থাপনা ও আচরণবিধি:</span>
                <p>CRM রেজিস্টারে গ্রাহক তথ্য সংরক্ষণ। অভিযোগ ২৪ ঘণ্টার মধ্যে নিবন্ধন করে দ্রুত নিষ্পত্তি। বিক্রয়োত্তর সেবা নিশ্চিত করা। ভদ্র, পেশাদার আচরণ বজায় রাখা এবং কোনো অবস্থাতেই মিথ্যা তথ্য না দেওয়া।</p>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-foreground block">৬.১৩ KPI মূল্যায়নের সূচকসমূহ:</span>
                <p>১. মাসিক বিক্রয় অর্জন (%), ২. নতুন গ্রাহক ও ডিলার সংখ্যা, ৩. বকেয়া আদায়ের হার, ৪. সময়মতো রিপোর্ট জমা এবং ৫. গ্রাহক সন্তুষ্টির মানদণ্ড।</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/15 p-4 rounded-xl text-xs text-muted-foreground">
            <strong className="text-foreground block mb-1">পুরস্কার ও প্রণোদনা:</strong>
            কাজের অগ্রগতির ও দক্ষতার ভিত্তিতে মাসিকসেরা সেলস এক্সিকিউটিভ সম্মাননা, বিক্রয় কমিশন, বিশেষ ইনসেনティブ ও পদোন্নতির ব্যবস্থা করা হবে। কিন্তু ভুয়া রিপোর্ট প্রদান বা অর্থ আত্মসাতের ক্ষেত্রে চাকরিচ্যুতির ব্যবস্থা নেওয়া হবে।
          </div>
        </div>
      </section>

      {/* 8. CHAPTER 7: DEALER POLICY */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground font-heading">অধ্যায় ৭: ডিলার ব্যবস্থাপনা নীতিমালা (Dealer Management Policy)</h2>

          <div className="space-y-4 text-xs md:text-sm text-muted-foreground">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="font-bold text-foreground block">৭.৩ ডিলার নির্বাচনের যোগ্যতা:</span>
                <p>বাংলাদেশের বৈধ নাগরিক (NID কার্ডসহ), স্থায়ী ব্যবসায়িক ঠিকানা ও শোরুম থাকা আবশ্যক। পর্যাপ্ত গুদাম বা পণ্য সংরক্ষণের সুবিধা এবং আর্থিক বিনিয়োগের সক্ষমতা থাকতে হবে।</p>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-foreground block">৭.৪ প্রয়োজনীয় ডকুমেন্টস:</span>
                <p>ডিলার আবেদনপত্র, NID কপি, পাসপোর্ট ছবি, ট্রেড লাইসেন্স কপি, TIN ও BIN (যদি থাকে), ব্যাংক স্টেটমেন্ট এবং ব্যবসা প্রতিষ্ঠানের ছবি ও ঠিকানা।</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <span className="font-bold text-foreground block">৭.৫ ডিলার অনুমোদন প্রক্রিয়া:</span>
              <p>আবেদন গ্রহণ → প্রাথমিক যাচাই → মাঠ পর্যায়ে পরিদর্শন ও গুদাম যাচাই → আর্থিক সক্ষমতা মূল্যায়ন → ব্যবস্থাপনা কর্তৃপক্ষের অনুমোদন → ডিলার চুক্তি স্বাক্ষর ও ডিলার কোড প্রদান।</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 border-t border-border pt-4">
              <div className="space-y-2">
                <span className="font-bold text-foreground block">ডিলারের দায়িত্বসমূহ:</span>
                <p>কোম্পানির নির্ধারিত মূল্যে পণ্য বিক্রয় করা, নকল বা ভেজাল পণ্য কোম্পানির ব্র্যান্ড নামে বিক্রয় না করা, কোম্পানির সুনাম অক্ষুণ্ন রাখা এবং সময়মতো বকেয়া অর্থ পরিশোধ করা।</p>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-foreground block">কোম্পানির দায়িত্বসমূহ:</span>
                <p>ডিলারকে চাহিদা অনুযায়ী পণ্য সরবরাহ, পণ্যের তথ্য ও বিপণন সহায়তা প্রদান, প্রচারসামগ্রী বিতরণ এবং চুক্তি অনুযায়ী ডিলার কমিশন/ইনসেনティブ প্রদান করা।</p>
              </div>
            </div>
          </div>

          <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 border border-rose-100 dark:border-rose-900 rounded-xl space-y-2 text-rose-950 dark:text-rose-200 text-xs">
            <strong className="block flex items-center gap-1.5 text-rose-600"><BadgeAlert className="h-4.5 w-4.5" /> ডিলারশিপ বাতিলের শর্তাবলী ও মেয়াদ:</strong>
            <p>ডিলার নিয়োগ প্রাথমিকভাবে ১ বছরের জন্য কার্যকর থাকবে এবং কর্মদক্ষতার ভিত্তিতে নবায়ন করা হবে। প্রতারণা, জاليةতি, কোম্পানির প্যাকেটে ভেজাল পণ্য বিক্রয় বা চুক্তি ভঙ্গ করলে ডিলারশিপ তাৎক্ষণিকভাবে বাতিল করা হবে।</p>
          </div>
        </div>
      </section>

      {/* 9. SOP FORMS DIRECTORY */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl space-y-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              SOP ফরম সমূহ (Forms & Formats)
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-foreground font-heading">প্রতিষ্ঠানের স্ট্যান্ডার্ড অপারেটিং ফরম্যাট</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              এনবি সাফা এগ্রো-এর দৈনন্দিন অপারেশনাল, ফাইন্যান্সিয়াল, স্টক ও এইচআর কার্যক্রম পরিচালনার জন্য ব্যবহৃত প্রধান ২০টি ফর্ম্যাট।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {formsList.map((form) => {
              const isExpanded = expandedForm === form.id;
              return (
                <div key={form.id} className="bg-card border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-sm">
                  <button
                    onClick={() => toggleForm(form.id)}
                    className="w-full flex items-center justify-between text-left font-bold text-xs md:text-sm text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span>{form.title}</span>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider block mb-2">প্রয়োজনীয় ফিল্ডসমূহ:</span>
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                        {form.fields.map((field, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 bg-primary rounded-full" />
                            <span>{field}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground bg-primary/5 border border-primary/15 rounded-xl p-4 max-w-3xl mx-auto">
            <span className="font-bold text-foreground">সমাপনী ঘোষণা:</span> এই SOP ম্যানুয়ালের সকল নীতিমালা, প্রক্রিয়া ও ফরম এনবি সাফা এগ্রো-এর সম্পত্তি। প্রতিষ্ঠানের প্রয়োজন, আইনগত পরিবর্তন বা ব্যবসায়িক বাস্তবতার আলোকে ব্যবস্থাপনা কর্তৃপক্ষ সময়ে সময়ে এই ম্যানুয়াল সংশোধন, সংযোজন বা পরিমার্জন করার অধিকার সংরক্ষণ করে।
          </div>
        </div>
      </section>


    </div>
  );
}
