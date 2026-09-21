import { NextResponse } from "next/server"; import crypto from "crypto";
import { COOKIE, sign } from "@/lib/token"; import { hit } from "@/lib/rate";
const h = (s: string) => crypto.createHash("sha256").update(s).digest();
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!hit(`login:${ip}`, 5, 15 * 60_000)) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  const pw = process.env.ADMIN_PASSWORD; if (!pw || !process.env.ADMIN_SESSION_SECRET) return NextResponse.json({ error: "Admin login is not configured on the server." }, { status: 503 });
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!crypto.timingSafeEqual(h(String(password)), h(pw))) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await sign(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 3600 });
  return res;
}
export async function DELETE() { const r = NextResponse.json({ ok: true }); r.cookies.delete(COOKIE); return r; }
