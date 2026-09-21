import { NextResponse } from "next/server";
import { getPublicStatus } from "@/lib/db";
import { hit } from "@/lib/rate";

const labels: Record<string, string> = { NEW: "Received", "UNDER REVIEW": "Under review", SHORTLISTED: "Shortlisted", SELECTED: "Selected", REJECTED: "Not selected this time", "INTERNSHIP STARTED": "Internship in progress", COMPLETED: "Completed" };
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!hit(`status:${ip}`, 20, 3600_000)) return NextResponse.json({ status: null });
  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "", email = typeof body.email === "string" ? body.email : "";
  const app = /^DIG-\d{4}-\d{4,}$/.test(id) ? await getPublicStatus(id, email) : null;
  return NextResponse.json({ status: app ? labels[app.admin.status] || "Received" : null });
}