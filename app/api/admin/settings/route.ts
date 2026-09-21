import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { putSetting } from "@/lib/db";
export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.location !== undefined) {
    if (typeof body.location !== "string" || body.location.length > 200) return NextResponse.json({ error: "Invalid location" }, { status: 422 });
    await putSetting("location", body.location.replace(/[<>]/g, "").trim());
  }
  if (body.intake !== undefined) {
    const x = body.intake;
    if (!x || typeof x.open !== "boolean" || (x.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(x.deadline)) || ![x.capVideo, x.capDesign].every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 100000)) return NextResponse.json({ error: "Invalid intake settings" }, { status: 422 });
    await putSetting("intake", JSON.stringify({ open: x.open, deadline: x.deadline || "", capVideo: x.capVideo, capDesign: x.capDesign }));
  }
  return NextResponse.json({ ok: true });
}
