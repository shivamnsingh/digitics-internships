"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FloatingApply() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const targets = [document.getElementById("hero-apply"), document.getElementById("footer-apply")].filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const observer = new IntersectionObserver((entries) => setVisible(!entries.some((entry) => entry.isIntersecting)), { threshold: 0.1 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  return visible ? <Link href="/apply" className="btn-y fixed inset-x-5 bottom-4 z-20 min-h-11 shadow-2xl md:hidden">Apply now</Link> : null;
}