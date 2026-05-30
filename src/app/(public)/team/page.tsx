"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Share2, 
  MessageCircle, 
  ArrowRight, 
  Award, 
  Globe,
  PhoneCall,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTeamMembers } from '@/app/actions/team';

type TeamMemberType = {
  _id?: string;
  name: string;
  role: string;
  image: string;
  desc?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
};

const defaultTeam: TeamMemberType[] = [
  {
    name: "Imran Shuvo",
    role: "Founder & Chief Executive Officer",
    image: "https://i.ibb.co.com/zTBvBXws/lawyer-1.jpg",
    desc: "Visionary agricultural entrepreneur directing Shafa Agro's industrial development and dealer operations.",
    bio: "Imran founded Shafa Agro with a mission to bring scientific quality and tech-driven ledger systems to Bangladesh's livestock industry.",
    linkedin: "#",
    twitter: "#",
    facebook: "#"
  },
  {
    name: "Nicolas M. Baldwin",
    role: "Chief Livestock Nutritionist",
    image: "https://i.ibb.co.com/9HmBM6CH/lawyer-2.jpg",
    desc: "Animal feed specialist formulating our signature whole-crop maize silage starch levels.",
    bio: "Nicolas has over 15 years of experience in anaerobic forage preservation and dairy cattle metabolic efficiency programs.",
    linkedin: "#",
    twitter: "#",
    facebook: "#"
  },
  {
    name: "Emily R. Watson",
    role: "Head of Production Operations",
    image: "https://i.ibb.co.com/jZvGmbv6/lawyer-3.jpg",
    desc: "Supervising silage compaction machinery and quality packaging at our Bogura hub.",
    bio: "Emily oversees daily raw corn inputs, compaction, and double-barrier UV vacuum bagging lines to ensure mold-free fermentation.",
    linkedin: "#",
    twitter: "#",
    facebook: "#"
  },
  {
    name: "Michael J. Foster",
    role: "Logistics & Supply Chain Director",
    image: "https://i.ibb.co.com/MyKFRdNP/lawyer-4.jpg",
    desc: "Coordinating regional dispatch fleets, delivery schedules, and dealer stock levels.",
    bio: "Michael manages distribution operations, ensuring on-time truck deliveries to regional dealer nodes and farm cooperatives.",
    linkedin: "#",
    twitter: "#",
    facebook: "#"
  },
  {
    name: "Sophia T. Turner",
    role: "Quality Control & Lab Director",
    image: "https://i.ibb.co.com/7dHGRPKj/lawyer-5.jpg",
    desc: "Overseeing wet-chemistry tests and certifying our aflatoxin-free parameters.",
    bio: "Sophia manages Shafa Agro's onsite laboratory, running mycological screening checks to keep batches safe and certified.",
    linkedin: "#",
    twitter: "#",
    facebook: "#"
  },
  {
    name: "Daniel K. Harris",
    role: "Chief Finance & Ledger Auditor",
    image: "https://i.ibb.co.com/mCychrjx/lawyer-6.jpg",
    desc: "Managing corporate ledgers, investment audits, and director dividend balances.",
    bio: "Daniel directs financial tracking, auditing transactions, managing cash flow balance sheets, and releasing shareholder dividends.",
    linkedin: "#",
    twitter: "#",
    facebook: "#"
  }
];

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMemberType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamMembers()
      .then((data) => {
        if (data && data.length > 0) {
          setTeam(data);
        } else {
          setTeam(defaultTeam);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch team members:', err);
        setTeam(defaultTeam);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Framer Motion Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
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
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-card text-card-foreground border-b border-border py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background opacity-60 pointer-events-none" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center space-y-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 backdrop-blur-md"
          >
            <Users className="h-3.5 w-3.5" /> Corporate Leadership
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight leading-none text-foreground font-heading"
          >
            Our Specialist Team
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Meet the agricultural technicians, biochemists, logistics coordinators, and auditors driving Shafa Agro’s quality and logistics network.
          </motion.p>
        </div>
      </section>

      {/* 2. TEAM MEMBERS GRID */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-semibold">Loading team members...</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left"
            >
              {team.map((member, idx) => {
                const initials = member.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.div
                    key={member._id || idx}
                    variants={fadeUp}
                    className="group relative bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Photo Container */}
                      <div className="relative aspect-square rounded-xl bg-muted/60 border border-border flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:bg-primary/5">
                        {member.image ? (
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-4xl font-black text-primary/80 font-mono tracking-wider transition-all duration-500 group-hover:scale-110">
                            {initials}
                          </span>
                        )}
                        
                        {/* Hover Social Overlay */}
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          {member.linkedin && member.linkedin !== '#' && (
                            <Link href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-card border border-border hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all duration-300">
                              <Share2 className="h-4 w-4" />
                            </Link>
                          )}
                          {member.twitter && member.twitter !== '#' && (
                            <Link href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-card border border-border hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all duration-300">
                              <MessageCircle className="h-4 w-4" />
                            </Link>
                          )}
                          {member.facebook && member.facebook !== '#' && (
                            <Link href={member.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-card border border-border hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all duration-300">
                              <Globe className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base text-foreground font-heading">
                          {member.name}
                        </h3>
                        <span className="inline-block text-[10px] font-bold text-primary uppercase tracking-widest">
                          {member.role}
                        </span>
                      </div>

                      {member.desc && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {member.desc}
                        </p>
                      )}

                      {member.bio && (
                        <p className="text-[11px] text-muted-foreground/80 leading-relaxed border-t border-border/40 pt-3">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-3 text-[10px] text-muted-foreground font-bold uppercase">
                      <span>Verified Officer</span>
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* 3. CTA ENTRANCE */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="p-8 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-left"
          >
            <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none">
              <PhoneCall className="h-40 w-40 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground font-heading">Interested in joining our logistics network?</h3>
              <p className="text-xs text-muted-foreground max-w-xl">
                We are always expanding our regional distributor network. Connect with our client managers to see how you can earn commissions on high-starch maize silage sales.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center shrink-0 w-full md:w-auto">
              <Button asChild className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs py-5 px-5 rounded-lg shadow-md w-full sm:w-auto">
                <Link href="/login" className="flex items-center justify-center gap-1">
                  Contact Support <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
