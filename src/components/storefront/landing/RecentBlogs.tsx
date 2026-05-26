"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { BookOpen, Calendar, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function RecentBlogs() {
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/blogs?limit=4')
      .then(res => {
        if (res.ok) return res.json();
        return { blogs: [] };
      })
      .then(data => {
        setRecentBlogs(data.blogs || []);
      })
      .catch(err => {
        console.error('Failed to fetch recent blogs:', err);
      });
  }, []);

  if (recentBlogs.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-card border-t border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 gap-6"
        >
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">

            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">
              Recent News & Blog Posts
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              Stay updated with the latest farming tips, silage production techniques, and dairy yields insights from Shafa Agro.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-lg font-bold text-xs py-4 px-6 border-border hover:bg-muted text-foreground flex items-center gap-1.5 shrink-0 transition-all duration-300">
            <Link href="/blog" className="flex items-center gap-1">
              View All Blogs <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {recentBlogs.map((blog) => (
            <motion.div
              key={blog._id}
              variants={fadeUp}
              className="bg-background border border-border rounded-xl shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 group overflow-hidden flex flex-col justify-between"
            >
              <Link href={`/blog/${blog.slug}`} className="block overflow-hidden relative aspect-video bg-muted border-b border-border">
                {blog.thumbnail ? (
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
              </Link>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    {(() => {
                      try {
                        const date = new Date(blog.createdAt);
                        return isNaN(date.getTime())
                          ? 'Recent'
                          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      } catch (e) {
                        return 'Recent';
                      }
                    })()}
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground font-heading line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  {blog.metaDescription && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                      {blog.metaDescription}
                    </p>
                  )}
                </div>
                <div className="pt-2 border-t border-border/40">
                  <Link href={`/blog/${blog.slug}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                    Read Article <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
