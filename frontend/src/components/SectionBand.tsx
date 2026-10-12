import React from 'react';

export default function SectionBand({ numeral, tagline }: { numeral: string; tagline: string }) {
  return (
    <div className="w-full bg-linear-to-b from-indigo to-violet py-16 flex flex-col items-center justify-center text-center px-4 rounded-[14px] my-12 shadow-[0_3px_10px_rgba(29,43,115,0.08)] relative overflow-hidden">
      <div className="text-[120px] md:text-[160px] leading-none font-bold text-white opacity-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {numeral}
      </div>
      <h2 className="text-2xl md:text-3xl text-white font-semibold relative z-10">{tagline}</h2>
    </div>
  );
}
