"use client";
import { useState } from "react"; import { useRouter } from "next/navigation"; import Logo from "@/components/Logo";
export default function Login() {
  const [pw, setPw] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false), r = useRouter();
  async function go(ev: React.FormEvent) { ev.preventDefault(); setBusy(true); setErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (res.ok) { r.replace("/admin"); r.refresh(); } else { setErr((await res.json().catch(() => ({}))).error || "Login failed."); setBusy(false); } }
  return (<main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-5"><Logo h={38} /><h1 className="text-4xl font-extrabold">Admin sign in</h1>
    <form onSubmit={go} className="space-y-4"><label className="block text-sm font-semibold" htmlFor="pw">Password</label>
      <input id="pw" type="password" autoComplete="current-password" required className="input" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <p role="alert" className="text-sm text-red-400">{err}</p>}<button className="btn-y w-full" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button></form></main>);
}
