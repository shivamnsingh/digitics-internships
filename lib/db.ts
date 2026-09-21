import { createClient } from "@supabase/supabase-js";
import path from "path";
import { ADMIN_DEFAULT, type AdminData, type AppRow, type FormValues, type FileMeta } from "./form";
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = createClient(url || "https://missing.supabase.co", key || "missing", { auth: { autoRefreshToken: false, persistSession: false } });
export const DATA = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));
type AppRecord = { id: string; year: number; seq: number; email: string; role: string; created: string; data: FormValues & { files: FileMeta[] }; admin: AdminData; excel: string };
const parse = (r: AppRecord): AppRow => ({ id: r.id, created: r.created, data: r.data, admin: { ...ADMIN_DEFAULT, ...r.admin }, excel: r.excel || "pending" });
const checked = <T extends { data: unknown; error: { message: string } | null }>(result: T) => { if (result.error) throw new Error(result.error.message); return result.data; };
export async function insertApplication(d: FormValues, files: FileMeta[]): Promise<AppRow> {
  const year = new Date().getFullYear();
  const latestRows = checked(await db.from("applications").select("seq").eq("year", year).order("seq", { ascending: false }).limit(1)) as { seq: number }[];
  const latest = latestRows.at(0);
  const seq = (latest?.seq || 0) + 1;
  const row = checked(await db.from("applications").insert({ year, seq, id: `DIG-${year}-${String(seq).padStart(4, "0")}`, email: d.email.trim(), role: d.role, data: { ...d, files }, admin: ADMIN_DEFAULT, excel: "pending" }).select().single());
  return parse(row as AppRecord);
}
export async function getApp(id: string) { const row = checked(await db.from("applications").select("*").eq("id", id).maybeSingle()); return row ? parse(row as AppRecord) : null; }
export async function getPublicStatus(id: string, email: string) { const row = checked(await db.from("applications").select("*").eq("id", id.trim()).ilike("email", email.trim()).maybeSingle()); return row ? parse(row as AppRecord) : null; }
export async function listApps() { return (checked(await db.from("applications").select("*").order("created", { ascending: false })) as AppRecord[]).map(parse); }
export async function setAdmin(id: string, admin: AdminData) { checked(await db.from("applications").update({ admin }).eq("id", id)); }
export async function setExcel(id: string, excel: string) { checked(await db.from("applications").update({ excel }).eq("id", id)); }
export async function getSetting(k: string, fallback = "") { const row = checked(await db.from("settings").select("v").eq("k", k).maybeSingle()) as { v: string } | null; return row?.v ?? fallback; }
export async function putSetting(k: string, v: string) { checked(await db.from("settings").upsert({ k, v })); }
export type Intake = { open: boolean; deadline: string; capVideo: number; capDesign: number };
export async function getIntake(): Promise<Intake> {
  try { return { open: true, deadline: "", capVideo: 0, capDesign: 0, ...JSON.parse(await getSetting("intake", "{}")) }; }
  catch { return { open: true, deadline: "", capVideo: 0, capDesign: 0 }; }
}
