import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verify } from "@/lib/token";
export async function middleware(r: NextRequest) {
  const p = r.nextUrl.pathname;
  if (p === "/admin/login" || p === "/api/admin/login") return NextResponse.next();
  if (await verify(r.cookies.get(COOKIE)?.value)) return NextResponse.next();
  return p.startsWith("/api/") ? NextResponse.json({ error: "Unauthorized" }, { status: 401 }) : NextResponse.redirect(new URL("/admin/login", r.url));
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
