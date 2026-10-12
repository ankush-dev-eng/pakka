"use client";

import React, { useEffect, useState } from 'react';
import { getStats } from '@/lib/api';
import GridBackground from '@/components/GridBackground';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export default function CommunityPage() {
  const [stats, setStats] = useState<{ total_analyzed: number; likely_scams: number; top_patterns?: {name: string, count: number}[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <main className="relative min-h-screen pt-32 pb-16 px-4 flex flex-col items-center overflow-x-hidden">
      <GridBackground />
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="max-w-4xl w-full mx-auto relative z-10"
      >
        <motion.h1 
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="text-5xl font-extrabold text-ink mb-6 text-center drop-shadow-sm"
        >
          {t.communityStats?.title || "Community Safety"}
        </motion.h1>
        <motion.p 
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="text-xl text-indigo text-center mb-16 leading-relaxed max-w-2xl mx-auto"
        >
          {t.communityStats?.subtitle || "Every report helps protect the next student. Here's what we've found so far."}
        </motion.p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 animate-pulse">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-10 text-center shadow-sm h-44 flex flex-col items-center justify-center">
            <div className="h-14 w-28 bg-slate-200 rounded-lg mb-4"></div>
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-10 text-center shadow-sm h-44 flex flex-col items-center justify-center">
            <div className="h-14 w-28 bg-slate-200 rounded-lg mb-4"></div>
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-red-200 p-8 text-center shadow-sm mb-16">
          <p className="text-[--coral] font-semibold text-lg mb-2">Unable to load community statistics</p>
          <p className="text-sm text-ink/70 mb-4">We couldn't connect to the statistics service. Please try again.</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(false);
              getStats().then(setStats).catch(() => setError(true)).finally(() => setLoading(false));
            }}
            className="px-5 py-2 rounded-xl bg-indigo text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      ) : (
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-10 text-center shadow-sm transform transition hover:-translate-y-1">
            <div className="text-6xl font-extrabold text-indigo mb-3 drop-shadow-sm">{stats?.total_analyzed ?? 0}</div>
            <div className="text-ink uppercase tracking-wider text-sm font-bold opacity-80">{t.communityStats?.offersChecked || "Offers Checked"}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-10 text-center shadow-sm transform transition hover:-translate-y-1">
            <div className="text-6xl font-extrabold text-coral mb-3 drop-shadow-sm">{stats?.likely_scams ?? 0}</div>
            <div className="text-ink uppercase tracking-wider text-sm font-bold opacity-80">{t.communityStats?.scamsFlagged || "Scams Flagged"}</div>
          </div>
        </motion.div>
      )}

      <motion.h2 
        variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
        className="text-3xl font-bold text-ink mb-6 text-center md:text-left drop-shadow-sm"
      >
        {t.communityStats?.recentPatterns || "Recent Reported Patterns"}
      </motion.h2>
      {loading ? (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 rounded-lg"></div>
          <div className="h-12 bg-slate-200 rounded-lg"></div>
        </div>
      ) : stats?.top_patterns && stats.top_patterns.length > 0 ? (
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] overflow-hidden shadow-sm"
        >
          <ul className="divide-y divide-border/50">
            {stats.top_patterns.map((pattern: {name: string, count: number}, idx: number) => (
              <li key={idx} className="p-6 flex justify-between items-center hover:bg-white/50 transition-colors">
                <div>
                  <p className="font-bold text-ink text-lg capitalize">{pattern.name ? pattern.name.replace(/_/g, " ") : "Unknown Pattern"}</p>
                  <p className="text-sm text-indigo font-medium">{t.communityStats?.commonFlag || "Commonly reported red flag"}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo/10 flex items-center justify-center shrink-0">
                  <span className="text-indigo text-xs font-bold">{pattern.count}</span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="bg-white/50 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-10 text-center shadow-sm"
        >
          <p className="text-ink/70 font-medium">{t.communityStats?.noData || "Community data is not yet available for recent patterns."}</p>
        </motion.div>
      )}
      </motion.div>
    </main>
  );
}
