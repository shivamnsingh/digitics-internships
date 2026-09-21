import { isAdmin } from "@/lib/auth"; import { getApp } from "@/lib/db"; import { storage } from "@/lib/storage";
export const runtime = "nodejs";
const TYPES: Record<string, string> = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", mp4: "video/mp4", mov: "video/quicktime", zip: "application/zip" };
export async function GET(req: Request, { params }: { params: { id: string; stored: string } }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const f = (await getApp(params.id))?.data.files[Number(params.stored)]; // [stored] is the file index; only files recorded in the DB can be read
  if (!f) return new Response("Not found", { status: 404 });
  const ext = f.stored.split(".").pop()!, dl = new URL(req.url).searchParams.has("dl") || ext === "zip";
  return new Response(new Uint8Array(await storage.read(f.stored)), { headers: { "Content-Type": TYPES[ext] || "application/octet-stream", "Content-Disposition": `${dl ? "attachment" : "inline"}; filename="${f.name}"`, "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox" } });
}
