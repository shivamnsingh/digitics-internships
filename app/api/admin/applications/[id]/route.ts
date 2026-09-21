import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth"; import { getApp, setAdmin, setExcel } from "@/lib/db"; import { updateRow } from "@/lib/excel";
import { ADMIN_OPTS, STATUSES, type AdminData } from "@/lib/form";
export const runtime = "nodejs";
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const app = await getApp(params.id); if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const b = await req.json().catch(() => ({})), a: AdminData = { ...app.admin };
  if (b.status !== undefined) { if (!STATUSES.includes(b.status)) return NextResponse.json({ error: "Invalid status" }, { status: 422 }); a.status = b.status; }
  for (const k of Object.keys(ADMIN_OPTS) as (keyof typeof ADMIN_OPTS)[]) if (b[k] !== undefined) { if (!(ADMIN_OPTS[k] as readonly string[]).includes(b[k])) return NextResponse.json({ error: `Invalid ${k}` }, { status: 422 }); (a as any)[k] = b[k]; }
  for (const k of ["internshipStart", "internshipEnd"] as const) if (b[k] !== undefined) a[k] = /^\d{4}-\d{2}-\d{2}$/.test(b[k]) ? b[k] : "";
  if (typeof b.note === "string" && b.note.trim()) a.notes = [...a.notes, { at: new Date().toISOString(), text: b.note.replace(/[<>]/g, "").trim().slice(0, 2000) }];
  await setAdmin(app.id, a);
  const fresh = (await getApp(app.id))!;
  await setExcel(app.id, await updateRow(fresh).catch((e) => "error: " + e.message));
  return NextResponse.json({ admin: fresh.admin });
}
