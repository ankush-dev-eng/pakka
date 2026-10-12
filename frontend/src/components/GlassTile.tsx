import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassTileProps {
  children: ReactNode;
  className?: string;
}

export function GlassTile({ children, className }: GlassTileProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-white/95 to-white/70 backdrop-blur-md rounded-2xl shadow-[0_3px_10px_rgba(29,43,115,0.08)] border border-white/80",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-white/10 opacity-50 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
