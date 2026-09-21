"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
// Yellow dot + trailing ring. Grows on interactive things, shows a label where [data-cursor] is set,
// hides over form fields (native caret is kept), and is off for touch devices, reduced motion and /admin.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null), label = useRef<HTMLSpanElement>(null), path = usePathname();
  useEffect(() => {
    if (path.startsWith("/admin") || !matchMedia("(pointer:fine)").matches) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches, root = document.documentElement;
    root.classList.add("has-cursor");
    let x = -100, y = -100, rx = x, ry = y, raf = 0, hidden = true, mode = "", lbl = "";
    const paint = () => {
      rx += (x - rx) * (still ? 1 : 0.16); ry += (y - ry) * (still ? 1 : 0.16);
      dot.current!.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.current!.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(paint);
    };
    const apply = () => { const d = dot.current!, r = ring.current!; d.style.opacity = r.style.opacity = hidden || mode === "field" ? "0" : "1"; r.dataset.mode = mode; label.current!.textContent = lbl; };
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY; root.style.setProperty("--mx", x + "px"); root.style.setProperty("--my", y + "px");
      const t = e.target as HTMLElement, tag = t.closest?.("[data-cursor]") as HTMLElement | null;
      const m = t.closest?.("input,textarea,select") ? "field" : tag ? "label" : t.closest?.("a,button,summary,label,[role=button]") ? "link" : "";
      const l = tag?.dataset.cursor || "";
      if (hidden || m !== mode || l !== lbl) { hidden = false; mode = m; lbl = l; apply(); }
    };
    const leave = () => { hidden = true; apply(); };
    const down = () => ring.current!.classList.add("cursor-down"), up = () => ring.current!.classList.remove("cursor-down");
    addEventListener("pointermove", move); document.addEventListener("pointerleave", leave); addEventListener("pointerdown", down); addEventListener("pointerup", up);
    raf = requestAnimationFrame(paint);
    return () => { cancelAnimationFrame(raf); root.classList.remove("has-cursor"); removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); removeEventListener("pointerdown", down); removeEventListener("pointerup", up); };
  }, [path]);
  return (<div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100]">
    <div ref={dot} className="fixed left-0 top-0 opacity-0 transition-opacity"><div className="-ml-1 -mt-1 h-2 w-2 rounded-full bg-y" /></div>
    <div ref={ring} data-mode="" className="cursor-ring fixed left-0 top-0 opacity-0 transition-opacity"><div className="cursor-body"><span ref={label} className="cursor-label" /></div></div></div>);
}
