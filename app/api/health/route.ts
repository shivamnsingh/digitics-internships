import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  await getSetting("health", "ok");
  return NextResponse.json({ ok: true });
}