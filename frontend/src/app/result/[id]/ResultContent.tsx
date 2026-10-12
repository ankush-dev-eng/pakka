"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAnalysis } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { GlassTile } from "@/components/GlassTile";
import GridBackground from "@/components/GridBackground";
import { HighlightedText, RedFlag } from "@/components/HighlightedText";
import { Loader2, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { motion, animate } from "framer-motion";

export interface ReportData {
  id: string;
  text: string;
  verdict: string;
  score: number;
  flags: RedFlag[];
  next_steps: string[];
}

export default function ResultContent() {
  const { id } = useParams();
  const { t, lang } = useTranslation();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!id) return;
    const analysisId = Array.isArray(id) ? id[0] : id;
    getAnalysis(analysisId, lang)
      .then((res) => {
        setData(res);
        animate(0, res.score, {
          duration: 1,
          ease: "easeOut",
          onUpdate(value) {
            setDisplayScore(Math.round(value));
          }
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, lang]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue mb-4" />
        <p className="text-indigo font-medium">{t.checking}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-coral font-medium">{t.notFound}</p>
      </main>
    );
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "looks_pakka": return "text-teal";
      case "be_careful": return "text-amber";
      case "likely_scam": return "text-coral";
      default: return "text-indigo";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "looks_pakka": return <ShieldCheck className="w-6 h-6 text-teal" />;
      case "be_careful": return <AlertTriangle className="w-6 h-6 text-amber" />;
      case "likely_scam": return <ShieldAlert className="w-6 h-6 text-coral" />;
      default: return null;
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center py-8 pt-24 overflow-x-hidden">
      <GridBackground />


      <div className="w-full max-w-6xl px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Card: Input Text */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-ink mb-4">{t.analyzedText}</h2>
          <GlassTile className="flex-1 p-6">
            <HighlightedText text={data.text} flags={data.flags} />
          </GlassTile>
        </div>

        {/* Right Card: Result Details */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-ink mb-4">{t.verdict}</h2>
          <GlassTile className="flex-1 p-6 flex flex-col">
            {data.verdict === "insufficient_information" ? (
              <div className="flex flex-col items-center justify-center h-full text-center my-8">
                <AlertTriangle className="w-16 h-16 text-amber mb-4" />
                <h3 className="text-2xl font-bold text-ink mb-3">{t.insufficientInfo || "Insufficient Information"}</h3>
                <p className="text-indigo text-lg max-w-md">
                  {t.insufficientInfoDesc || "The provided text doesn't contain enough meaningful offer details to analyze. Please provide a complete job offer, email, or message."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className={`relative w-24 h-24 flex items-center justify-center shrink-0 ${getVerdictColor(data.verdict)}`}>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-current opacity-20" strokeWidth="8" fill="none" />
                      <motion.circle 
                        cx="50" cy="50" r="40" 
                        className="stroke-current" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray={251.2}
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (data.score / 100) * 251.2 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                      {displayScore}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getVerdictIcon(data.verdict)}
                      <h3 className={`text-xl font-bold capitalize ${getVerdictColor(data.verdict)}`}>
                        {t.verdicts && t.verdicts[data.verdict as keyof typeof t.verdicts] 
                          ? t.verdicts[data.verdict as keyof typeof t.verdicts] 
                          : data.verdict.replace(/_/g, " ")}
                      </h3>
                    </div>
                    <p className="text-sm text-indigo">{t.trustScore}</p>
                  </div>
                </div>

            <h3 className="font-bold text-ink mb-3">{t.redFlags}</h3>
            <ul className="flex flex-col gap-3 mb-6 flex-1">
              {data.flags?.map((flag, i: number) => {
                // Try to find translated flag using the ID. The DB has flag.id.
                const transFlag = t.flags && t.flags[flag.id as keyof typeof t.flags];
                const title = transFlag ? transFlag.title : flag.title;
                const reason = transFlag ? transFlag.reason : flag.reason;
                return (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-ink text-sm flex items-center gap-2">
                        {flag.weight >= 40 ? <AlertTriangle className="w-4 h-4 text-coral" /> : <AlertTriangle className="w-4 h-4 text-amber" />}
                        {title}
                      </span>
                      <span className="text-xs bg-coral/10 text-coral px-2 py-1 rounded-md font-mono shrink-0 ml-2 font-semibold">
                        {flag.weight}pts
                      </span>
                    </div>
                    <p className="text-sm text-indigo mb-3 leading-relaxed">{reason}</p>
                    {flag.evidence?.length > 0 && (
                      <button className="text-xs text-blue hover:text-blue/80 font-medium flex items-center gap-1 transition-colors">
                        {t.showInText} <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </motion.li>
                );
              })}
              {(!data.flags || data.flags.length === 0) && (
                <p className="text-sm text-indigo">{t.noRedFlags}</p>
              )}
            </ul>

            <div className="mt-auto pt-6 border-t border-border">
              <h3 className="font-bold text-ink mb-3">{t.nextSteps}</h3>
              <ul className="list-disc list-inside text-sm text-indigo mb-4 flex flex-col gap-1">
                {(t.defaultNextSteps || data.next_steps)?.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-blue text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue/90 transition-colors"
                >
                  {t.report}
                </a>
                <button 
                  className="flex-1 bg-white text-ink border border-border px-4 py-2 rounded-xl text-sm font-medium hover:border-blue transition-colors"
                  onClick={async () => {
                    try {
                      if (!data) return;
                      const pack = await import("@/lib/api").then(m => m.getReportPack(data.id));
                      await navigator.clipboard.writeText(pack.html || JSON.stringify(pack));
                      alert("Copied!");
                    } catch (err) {
                      console.error(err);
                      alert("Failed to copy complaint details.");
                    }
                  }}
                >
                  {t.copyComplaint}
                </button>
              </div>
              <p className="text-xs text-center text-indigo/60 mt-3">
                {t.disclaimer}
              </p>
            </div>
            </>
          )}
          </GlassTile>
        </div>
      </div>
    </main>
  );
}
