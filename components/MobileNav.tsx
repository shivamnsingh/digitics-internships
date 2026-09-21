"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const links = [["Internship", "#internship"], ["Roles", "#roles"], ["Benefits", "#benefits"], ["Process", "#process"], ["FAQ", "#faq"], ["Check status", "/status"]];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) { trigger.current?.focus(); return; }
    const first = panel.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); return; }
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>("a,button"));
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); focusable[0]?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return <div className="md:hidden">
    <button ref={trigger} type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-white/20 text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-y" onClick={() => setOpen((value) => !value)}>
      <span aria-hidden="true">{open ? "×" : "☰"}</span>
    </button>
    {open && <div ref={panel} id="mobile-navigation" className="absolute inset-x-0 top-full border-b border-white/15 bg-black/95 px-5 pb-5 pt-3 shadow-2xl" role="dialog" aria-label="Mobile navigation">
      <nav className="flex flex-col gap-1" aria-label="Mobile">
        {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-11 items-center border-b border-white/10 text-lg text-white/80 hover:text-y">{label}</Link>)}
        <Link href="/apply" onClick={() => setOpen(false)} className="btn-y mt-3 min-h-11">Apply now</Link>
      </nav>
    </div>}
  </div>;
}