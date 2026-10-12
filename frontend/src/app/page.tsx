import { GlassTile } from "@/components/GlassTile";
import GridBackground from "@/components/GridBackground";
import { InputCard } from "@/components/InputCard";

import { Scan, CheckCircle, Map, ShieldCheck } from "lucide-react";
import * as motion from "framer-motion/client";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center pb-24 overflow-hidden">
      <GridBackground />
      
      {/* Hero Section */}
      <section className="relative w-full pt-28 pb-40 flex flex-col items-center text-center px-4">
        <motion.div 
          className="absolute inset-0 z-[-1] bg-[linear-gradient(to_bottom,#0C1434_0%,#28408C_20%,#5C66BE_40%,#9680C8_60%,#DE96B8_80%,#F4C4AA_95%,#F4F7FD_100%)]" 
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 z-[-1] opacity-15 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3 mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">pakka</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-3xl drop-shadow-sm"
        >
          Is this offer actually real?
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/90 max-w-xl mb-12 leading-relaxed"
        >
          An AI fraud analyst for every student&apos;s inbox. Paste, upload or screenshot any job or internship offer and get a Trust Score.
        </motion.p>
      </section>

      <InputCard />

      {/* Feature Cards */}
      <section className="w-full max-w-5xl px-4 mt-24">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}>
            <GlassTile className="p-6 h-full hover:scale-[1.02] transition-transform">
              <Scan className="w-8 h-8 text-blue mb-4" />
              <h3 className="font-bold text-lg mb-2">Scan</h3>
              <p className="text-indigo text-sm">We check 12 known patterns of fraud, from lookalike domains to fee requests.</p>
            </GlassTile>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}>
            <GlassTile className="p-6 h-full hover:scale-[1.02] transition-transform">
              <CheckCircle className="w-8 h-8 text-teal mb-4" />
              <h3 className="font-bold text-lg mb-2">Judge</h3>
              <p className="text-indigo text-sm">A deterministic score gives you a clear verdict, explained simply.</p>
            </GlassTile>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}>
            <GlassTile className="p-6 h-full hover:scale-[1.02] transition-transform">
              <Map className="w-8 h-8 text-violet mb-4" />
              <h3 className="font-bold text-lg mb-2">Guide</h3>
              <p className="text-indigo text-sm">Know exactly what to do next, from verifying officially to reporting on cybercrime.gov.in.</p>
            </GlassTile>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
