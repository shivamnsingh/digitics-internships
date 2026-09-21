import { isAdmin } from "@/lib/auth";
import { listApps } from "@/lib/db";

const cell = (value: unknown) => {
  const text = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = await listApps();
  const header = ["Application ID", "Name", "Email", "Role", "Duration", "Status", "Applied"];
  const csv = [header, ...rows.map((a) => [a.id, a.data.fullName, a.data.email, a.data.role, a.data.duration, a.admin.status, a.created.slice(0, 10)])].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=applications.csv", "X-Content-Type-Options": "nosniff" } });
}