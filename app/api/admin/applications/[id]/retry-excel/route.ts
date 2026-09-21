import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getApp, setExcel } from "@/lib/db";
import { appendRow } from "@/lib/excel";

export const runtime = "nodejs";
export async function POST(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const app = await getApp(params.id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const result = await appendRow(app).catch((error) => `error: ${error.message}`);
  await setExcel(app.id, result);
  return NextResponse.json({ excel: result }, { status: result.startsWith("error") ? 502 : 200 });
}