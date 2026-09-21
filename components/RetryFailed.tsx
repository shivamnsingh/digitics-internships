"use client";
import { useState } from "react";

export default function RetryFailed({ count }: { count: number }) {
  const [message, setMessage] = useState("");
  if (!count) return null;
  return <div className="flex flex-wrap items-center gap-3"><button type="button" className="btn-o min-h-11 !py-2 text-sm" onClick={async () => { const response = await fetch("/api/admin/retry-excel", { method: "POST" }); const data = await response.json(); setMessage(response.ok ? `Synced ${data.synced} of ${data.attempted}.` : "Retry failed."); }}>Retry all failed</button>{message && <span role="status" className="text-sm text-y">{message}</span>}</div>;
}