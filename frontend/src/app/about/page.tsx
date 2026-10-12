"use client";
import React from 'react';
import SectionBand from '@/components/SectionBand';
import GridBackground from '@/components/GridBackground';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useTranslation();
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
          {t.aboutUs?.title || "About Pakka"}
        </motion.h1>
        <motion.p 
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          className="text-xl text-indigo text-center mb-16 leading-relaxed max-w-2xl mx-auto"
        >
          {t.aboutUs?.subtitle || "An AI fraud analyst for every student's inbox."}
        </motion.p>

      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
        <SectionBand numeral="1" tagline={t.aboutUs?.missionTitle || "Our Mission"} />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="bg-white/70 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-8 shadow-sm mb-8">
        <p className="text-ink mb-4 leading-relaxed font-medium">
          {t.aboutUs?.missionDesc || "Pakka uses AI to analyze job offers and protect students from recruitment scams."}
        </p>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
        <SectionBand numeral="2" tagline={t.aboutUs?.howItWorksTitle || "How It Works"} />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="bg-white/70 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-8 shadow-sm mb-8">
        <p className="text-ink mb-4 leading-relaxed font-medium">
          {t.aboutUs?.howItWorksDesc || "Paste the text of any job offer, and our AI system will check for multiple risk signals like language, sender domain, and known fraud patterns."}
        </p>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
        <SectionBand numeral="3" tagline="Limits and Privacy" />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="bg-white/70 backdrop-blur-md rounded-2xl border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] p-8 shadow-sm">
        <p className="text-ink mb-4 font-medium leading-relaxed">
          Pakka gives risk signals, not proof of fraud. We are not lawyers, and our verdict is not legal advice.
        </p>
        <p className="text-ink font-medium leading-relaxed">
          We respect your privacy. We do not store raw offer text by default; we only store hashes and extracted entities to improve community safety.
        </p>
      </motion.div>
      </motion.div>
    </main>
  );
}
