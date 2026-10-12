"use client";

import { useMemo } from "react";

export interface FlagEvidence {
  start: number;
  end: number;
}

export interface RedFlag {
  id?: string;
  title: string;
  weight: number;
  reason: string;
  evidence: FlagEvidence[];
}

interface HighlightedTextProps {
  text: string;
  flags: RedFlag[];
}

export function HighlightedText({ text, flags }: HighlightedTextProps) {
  const parts = useMemo(() => {
    if (!flags || flags.length === 0) return [{ text, highlight: false, color: "" }];

    // Merge overlapping evidences
    const evidences: { start: number; end: number; weight: number }[] = [];
    flags.forEach(flag => {
      flag.evidence?.forEach(ev => {
        evidences.push({ start: ev.start, end: ev.end, weight: flag.weight });
      });
    });

    if (evidences.length === 0) return [{ text, highlight: false, color: "" }];

    evidences.sort((a, b) => a.start - b.start);
    
    // Simplistic merge for highlights
    const merged = [];
    let current = { ...evidences[0] };
    for (let i = 1; i < evidences.length; i++) {
      const next = evidences[i];
      if (next.start <= current.end) {
        current.end = Math.max(current.end, next.end);
        current.weight = Math.max(current.weight, next.weight);
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    merged.push(current);

    const result = [];
    let lastIndex = 0;
    merged.forEach(m => {
      if (m.start > lastIndex) {
        result.push({ text: text.slice(lastIndex, m.start), highlight: false, color: "" });
      }
      const color = m.weight >= 60 ? "decoration-coral bg-coral/10 text-coral" : "decoration-amber bg-amber/10 text-amber";
      result.push({ text: text.slice(m.start, m.end), highlight: true, color });
      lastIndex = m.end;
    });

    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex), highlight: false, color: "" });
    }
    return result;

  }, [text, flags]);

  return (
    <p className="whitespace-pre-wrap text-ink font-sans leading-relaxed">
      {parts.map((p, i) => (
        p.highlight ? (
          <span key={i} className={`underline underline-offset-4 decoration-2 ${p.color} font-medium px-1 rounded`}>
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      ))}
    </p>
  );
}
