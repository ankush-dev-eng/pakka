"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { LangSwitch } from "./LangSwitch";
import { analyzeOffer } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Loader2, UploadCloud, X, Link as LinkIcon, FileText, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

type InputMode = "text" | "pdf" | "screenshot" | "link";

export function InputCard() {
  const [mode, setMode] = useState<InputMode>("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { lang } = useI18n();
  const router = useRouter();

  const handleAnalyze = async () => {
    if (loading) return;

    if (mode === "text" && !content.trim()) {
      setError("Please paste the offer text.");
      return;
    }
    if (mode === "link" && !content.trim()) {
      setError("Please paste a valid URL.");
      return;
    }
    if ((mode === "pdf" || mode === "screenshot") && !file) {
      setError("Please upload a file.");
      return;
    }

    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const payload = (mode === "text" || mode === "link") ? content : file!;
      const result = await analyzeOffer(payload, lang, mode, controller.signal);
      router.push(`/result/${result.id}`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else if (err.message) {
          setError(err.message);
        } else {
          setError("Failed to analyze offer. Please try again.");
        }
      } else {
        setError("Failed to analyze offer. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleSample = (sampleText: string) => {
    setMode("text");
    setContent(sampleText);
    setFile(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const tabs: { id: InputMode; label: string; icon: React.ElementType }[] = [
    { id: "text", label: "Text", icon: FileText },
    { id: "pdf", label: "PDF", icon: FileText },
    { id: "screenshot", label: "Screenshot", icon: ImageIcon },
    { id: "link", label: "Link", icon: LinkIcon },
  ];

  const isEmpty = (mode === "text" || mode === "link") ? !content.trim() : !file;

  return (
    <>
      <motion.section 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full max-w-3xl px-4 -mt-24 z-10 relative"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,16,48,0.06)] p-6 border border-white">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 sm:gap-4 border-b border-border w-full overflow-x-auto relative" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={mode === tab.id}
                  onClick={() => {
                    setMode(tab.id);
                    setError(null);
                  }}
                  className={`px-4 py-2 flex items-center gap-2 whitespace-nowrap transition-colors relative ${
                    mode === tab.id
                      ? "font-medium text-ink"
                      : "font-medium text-indigo opacity-60 hover:opacity-100"
                  }`}
                >
                  {mode === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue"
                    />
                  )}
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Inputs */}
          <div className="mb-4">
            {mode === "text" && (
              <textarea 
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                aria-label="Paste the offer email, message, or text here"
                className="w-full h-40 p-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/50 focus:border-blue resize-none disabled:opacity-50 text-ink bg-white/80 transition-shadow"
                placeholder="Paste the offer email, message, or text here..."
              />
            )}
            
            {mode === "link" && (
              <input
                type="url"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                aria-label="Paste URL here"
                className="w-full p-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/50 focus:border-blue disabled:opacity-50 text-ink bg-white/80 transition-shadow"
                placeholder="https://example.com/job-offer"
              />
            )}

            {(mode === "pdf" || mode === "screenshot") && (
              <div className="w-full h-40 border-2 border-dashed border-border/70 rounded-xl flex flex-col items-center justify-center bg-paper/50 hover:bg-paper/80 transition-colors p-4">
                {file ? (
                  <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-border">
                    <span className="font-medium text-ink truncate max-w-50 sm:max-w-xs">{file.name}</span>
                    <button onClick={clearFile} disabled={loading} className="p-1 hover:bg-gray-100 rounded-full text-indigo">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-indigo opacity-50 mb-2" />
                    <p className="text-sm text-indigo mb-4">
                      {mode === "pdf" ? "Upload a PDF document" : "Upload an image (PNG, JPG)"}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept={mode === "pdf" ? ".pdf" : "image/*"}
                      onChange={handleFileChange}
                      disabled={loading}
                      className="sr-only peer"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue/90 peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue"
                    >
                      Choose File
                    </label>
                  </>
                )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200" role="alert">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <LangSwitch />
            <div className="flex flex-col items-end">
              <button 
                onClick={handleAnalyze}
                disabled={loading || isEmpty}
                aria-disabled={isEmpty}
                aria-describedby={isEmpty ? "submit-hint" : undefined}
                className="bg-blue text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-blue/20 hover:bg-blue/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md flex items-center justify-center gap-2 w-full sm:w-auto focus:ring-2 focus:ring-offset-2 focus:ring-blue"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Checking..." : "Check this offer"}
              </button>
              {isEmpty && (
                <span id="submit-hint" className="text-xs text-indigo mt-1 opacity-70">
                  {mode === 'pdf' || mode === 'screenshot' ? 'Select a file to check' : 'Provide input to check'}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-indigo mt-4">
          Pakka does not save your raw text.
        </p>
      </motion.section>

      {/* Try a Sample Row */}
      <section className="w-full max-w-4xl px-4 mt-16">
        <h3 className="text-center text-indigo font-medium mb-6">Or try a sample</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleSample("Pay ₹2000 registration fee for the training program via UPI to proceed with your selection.")}
            className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 hover:border-blue hover:-translate-y-1 hover:shadow-md transition-all text-left text-sm text-ink truncate focus:ring-2 focus:ring-blue/50 focus:outline-none"
          >
            &quot;Pay ₹2000 registration fee for...&quot;
          </button>
          <button 
            onClick={() => handleSample("Your interview for Software Engineer is scheduled for tomorrow at 10 AM. Please find the Google Meet link attached. HR Dept.")}
            className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 hover:border-blue hover:-translate-y-1 hover:shadow-md transition-all text-left text-sm text-ink truncate focus:ring-2 focus:ring-blue/50 focus:outline-none"
          >
            &quot;Your interview for Software Engineer...&quot;
          </button>
          <button 
            onClick={() => handleSample("Work from home, 5000/day, no interview needed. Reply immediately via Telegram to @HR_Recruit.")}
            className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 hover:border-blue hover:-translate-y-1 hover:shadow-md transition-all text-left text-sm text-ink truncate focus:ring-2 focus:ring-blue/50 focus:outline-none"
          >
            &quot;Work from home, 5000/day...&quot;
          </button>
        </div>
      </section>
    </>
  );
}
