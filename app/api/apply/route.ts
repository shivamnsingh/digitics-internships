import { NextResponse } from "next/server";
import crypto from "crypto";
import { applicationSchema, ROLE_Q, MAX_FILE, MAX_FILES, type FileMeta, type Role } from "@/lib/form";
import { getIntake, insertApplication, listApps, setExcel } from "@/lib/db";
import { appendRow } from "@/lib/excel"; import { sendConfirmation } from "@/lib/mail"; import { hit } from "@/lib/rate";
import { storage } from "@/lib/storage";
export const runtime = "nodejs";
const clean = (v: unknown): unknown => typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F<>]/g, "").trim().slice(0, 3000)
  : Array.isArray(v) ? v.slice(0, 20).map(clean) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)])) : v;
const fail = (status: number, error: string, fields?: object) => NextResponse.json({ error, fields }, { status });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!hit(`apply:${ip}`, 6, 3600_000)) return fail(429, "Too many attempts. Please try again in a while.");
  let fd: FormData, raw: unknown;
  try { fd = await req.formData(); raw = JSON.parse(String(fd.get("payload"))); } catch { return fail(400, "Invalid submission."); }
  if (raw && typeof raw === "object" && (raw as { website?: unknown }).website) return fail(400, "Invalid submission.");
  const p = applicationSchema.safeParse(clean(raw));
  if (!p.success) return fail(422, "Please fix the highlighted fields.", Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message])));
  const d = p.data, allowed: readonly string[] = ROLE_Q[d.role as Role].exts;
  const intake = await getIntake(), today = new Date().toISOString().slice(0, 10);
  if (!intake.open || (intake.deadline && intake.deadline < today)) return fail(409, "Applications are currently closed.");
  const cap = d.role === "video" ? intake.capVideo : intake.capDesign;
  if (cap > 0 && (await listApps()).filter((a) => a.data.role === d.role).length >= cap) return fail(409, "Applications for this role are currently full.");
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return fail(422, `Upload at most ${MAX_FILES} files.`);
  for (const f of files) {
    if (!allowed.includes(f.name.split(".").pop()!.toLowerCase())) return fail(422, `${f.name}: allowed formats are ${allowed.join(", ").toUpperCase()}.`);
    if (f.size > MAX_FILE) return fail(422, `${f.name} is larger than ${MAX_FILE / 1048576} MB.`);
  }
  const dir = crypto.randomUUID(), meta: FileMeta[] = [];
  try {
    for (const f of files) {
      const stored = `${crypto.randomUUID()}.${f.name.split(".").pop()!.toLowerCase()}`;
      await storage.save(dir, stored, new Uint8Array(await f.arrayBuffer()));
      meta.push({ name: f.name.replace(/[^\w.\- ]/g, "_").slice(0, 100), stored: `${dir}/${stored}`, size: f.size });
    }
  } catch { return fail(500, "We couldn't save your files. Your answers are safe — please try again."); }
  let app;
  try { app = await insertApplication(d, meta); }
  catch (e: any) {
    await storage.remove(dir);
    if (String(e?.code).startsWith("SQLITE_CONSTRAINT")) return fail(409, "An application for this role with this email already exists. If you think this is a mistake, contact Digitics.");
    return fail(500, "Something went wrong on our side. Please try again.");
  }
  // The application is already safely stored; Excel/email failures never lose it.
  await setExcel(app.id, await appendRow(app).catch((e) => { console.error("[excel]", e); return "error: " + e.message; }));
  await sendConfirmation(app).catch((e) => console.error("[mail]", e));
  return NextResponse.json({ id: app.id });
}
