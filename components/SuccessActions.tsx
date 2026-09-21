"use client";
import { useState } from "react";

export default function SuccessActions({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }
  const message = encodeURIComponent(`My Digitics application ID is ${id}.`);
  return <div className="mt-5 grid gap-3 sm:grid-cols-2">
    <button type="button" onClick={copy} className="btn min-h-11 bg-black text-white hover:bg-white hover:text-black">{copied ? "Copied" : "Copy Application ID"}</button>
    <a className="btn-o min-h-11" href={`https://wa.me/?text=${message}`} target="_blank" rel="noopener noreferrer">Share via WhatsApp</a>
  </div>;
}