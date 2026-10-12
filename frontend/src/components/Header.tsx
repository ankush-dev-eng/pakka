"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LangSwitch } from "./LangSwitch";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

export function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isLight = pathname?.startsWith("/result") || pathname?.startsWith("/about") || pathname?.startsWith("/community");
  const textClass = isLight ? "text-indigo" : "text-white";
  const mutedClass = isLight ? "text-indigo/80 hover:text-indigo" : "text-white/80 hover:text-white";

  return (
    <motion.header 
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 p-4 transition-colors duration-300 ${isLight ? "bg-white/70 backdrop-blur-md border-b border-indigo/10 shadow-sm" : "bg-[#0B1030]/20 backdrop-blur-md border-b border-white/10"}`}
    >
      <nav className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className={`flex items-center gap-2 font-bold ${textClass} text-xl tracking-tight`}>
          {pathname !== "/" && <span className={isLight ? "" : "opacity-80"}>pakka</span>}
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className={`text-sm font-medium ${mutedClass}`}>{t.nav?.about || "About"}</Link>
          <Link href="/community" className={`text-sm font-medium ${mutedClass}`}>{t.nav?.community || "Community"}</Link>
          {isLight && <LangSwitch />}
        </div>
      </nav>
    </motion.header>
  );
}
