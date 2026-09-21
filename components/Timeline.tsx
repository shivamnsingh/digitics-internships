"use client";
import { useRef, useState } from "react";
const V: [number, number, string][] = [[0, 21, "Reel"], [23, 17, "Promo"], [42, 30, "Story"], [74, 26, "Cut"]];
const D: [number, number, string][] = [[3, 17, "Poster"], [22, 25, "Brand"], [49, 21, "Type"], [72, 25, "Social"]];
const pad = (n: number) => String(n).padStart(2, "0");
export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null); const [p, setP] = useState<number | null>(null);
  const move = (e: React.PointerEvent) => { const b = ref.current!.getBoundingClientRect(); setP(Math.max(0, Math.min(100, ((e.clientX - b.left) / b.width) * 100))); };
  const t = (p ?? 0) * 0.6, on = ([l, w]: [number, number, string]) => p !== null && p >= l && p <= l + w;
  const track = (name: string, clips: [number, number, string][], cls: string) => (
    <div className="flex items-center gap-3"><span className="w-7 shrink-0 text-xs text-white/40">{name}</span>
      <div className="relative h-14 flex-1 rounded-lg bg-white/[.04]">{clips.map((c) => (
        <div key={c[2]} style={{ left: `${c[0]}%`, width: `${c[1]}%` }} className={`absolute inset-y-1 flex items-end rounded-md px-2 pb-1 text-xs font-semibold transition-colors ${on(c) ? "bg-y text-black" : cls}`}>{c[2]}</div>))}</div></div>);
  return (
    <div className="glass p-4 sm:p-6" aria-hidden="true">
      <div className="mb-4 flex items-center justify-between text-xs text-white/50"><span>digitics_internship.prproj</span><span className="tabular-nums text-y">00:{pad(Math.floor(t))}:{pad(Math.floor((t % 1) * 24))}</span></div>
      <div ref={ref} onPointerMove={move} onPointerLeave={() => setP(null)} className="relative touch-pan-y space-y-2 pl-10">
        <div className={`absolute bottom-0 top-0 z-10 w-px bg-y ${p === null ? "playhead-auto" : ""}`} style={p === null ? { marginLeft: 40 } : { left: `calc(40px + (100% - 40px) * ${p / 100})` }}>
          <span className="absolute -left-1.5 -top-1 h-3 w-3 rounded-sm bg-y" /></div>
        {track("V1", V, "bg-white/15 text-white")}{track("V2", D, "bg-white/[.08] text-white/80 border border-white/15")}
      </div>
    </div>);
}
