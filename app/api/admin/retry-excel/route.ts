import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listApps, setExcel } from "@/lib/db";
import { appendRow } from "@/lib/excel";

export const runtime = "nodejs";
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const failed = (await listApps()).filter((app) => app.excel.startsWith("error"));
  let synced = 0;
  const errors: { id: string; error: string }[] = [];
  for (const app of failed) {
    const result = await appendRow(app).catch((error) => `error: ${error.message}`);
    await setExcel(app.id, result);
    if (!result.startsWith("error")) synced++;
    else errors.push({ id: app.id, error: result });
  }
  return NextResponse.json({ attempted: failed.length, synced, errors });
}