"use client";
import { useState } from "react";
const SW = [["#FCD739", "#000"], ["#F4F2EA", "#000"], ["#000000", "#FCD739"], ["#3A3A3A", "#F4F2EA"]];
// The "Design" half of the hero: a tiny artboard you can recolor. (The timeline is the "Edit" half.)
export default function DesignCard() {
  const [i, setI] = useState(0), [bg, fg] = SW[i];
  return (<div className="glass p-4 sm:p-6">
    <div className="mb-4 flex items-center justify-between text-xs text-white/50"><span>digitics_brand.ai</span><span className="text-y">Artboard 1</span></div>
    <div className="grid grid-cols-[1fr_auto] gap-4">
      <div style={{ background: bg, color: fg }} className="relative grid h-36 place-items-center overflow-hidden rounded-xl border border-white/15 transition-colors duration-300">
        <span className="display text-7xl font-extrabold">Aa</span>
        <svg viewBox="0 0 120 60" className="absolute bottom-2 right-2 h-12 w-24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path className="draw" d="M4 52 C 30 4, 60 4, 70 30 S 100 56, 116 8" /><circle cx="4" cy="52" r="3" fill="currentColor" /><circle cx="116" cy="8" r="3" fill="currentColor" /></svg>
        <span className="absolute left-2 top-2 h-2 w-2 border-l border-t border-current opacity-60" /><span className="absolute right-2 top-2 h-2 w-2 border-r border-t border-current opacity-60" />
      </div>
      <div role="radiogroup" aria-label="Artboard colour" className="flex flex-col gap-2">{SW.map(([c], k) => <button key={c} role="radio" aria-checked={i === k} aria-label={`Colour ${c}`} onClick={() => setI(k)} style={{ background: c }} className={`h-7 w-7 rounded-full border transition ${i === k ? "scale-110 border-y ring-2 ring-y/50" : "border-white/30 hover:scale-110"}`} />)}</div>
    </div></div>);
}
