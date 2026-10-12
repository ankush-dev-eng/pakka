"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangSwitch() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex gap-2 text-xs uppercase tracking-[0.08em] font-mono">
      {(["en", "hi", "bn"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "px-2 py-1 rounded transition-colors",
            lang === l ? "bg-ink text-white" : "bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] text-ink hover:bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
