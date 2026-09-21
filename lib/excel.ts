// Isolated Microsoft Graph integration. Without credentials it runs in MOCK mode (appends to data/*.mock.csv).
import fs from "fs"; import path from "path";
import { ROLES, type AppRow, type Role } from "./form";
import { DATA } from "./db";
export const COLUMNS = ["Application ID","Application Date","Full Name","Email","Phone","City","Location","College","Degree/Course","Year","Semester","University/Board","College Email","College NOC Required","NOC Requirements","Expected Start Date","Expected End Date","Applied Role","Internship Duration","Offline Confirmation","Tools/Software","Experience Level","Skill Rating","Project Types","Client Experience","Portfolio Link","Demo Work Link","Uploaded Work","Why Digitics","Application Status","Admin Notes","Interview Status","Selection Status","Internship Start","Internship End","Completion Status","Certificate Status","College Letter Status","LOR Status","Under 18","Guardian Name","Guardian Phone","Guardian Consent"];
const cell = (v: unknown) => { const t = String(v ?? ""); return /^[=+\-@\t\r]/.test(t) ? "'" + t : t; }; // blocks Excel formula injection
export function rowFor({ id, created, data: d, admin: a }: AppRow) {
  return [id, created.slice(0, 10), d.fullName, d.email, d.phone, d.city, d.location, d.college, d.degree, d.year, d.semester, d.university, d.collegeEmail, d.noc, d.nocReq, d.startDate, d.endDate,
    ROLES[d.role as Role], d.duration, d.offline, d.tools.join(", "), d.experience, d.rating, d.types.join(", "), d.client + (d.clientDesc ? `: ${d.clientDesc}` : ""), d.portfolioSite, d.portfolio,
    d.files.map((f) => f.name).join(", "), d.why, a.status, a.notes.map((n) => `[${n.at.slice(0, 10)}] ${n.text}`).join(" | "), a.interviewStatus, a.selectionStatus, a.internshipStart, a.internshipEnd,
    a.completionStatus, a.certificateStatus, a.collegeLetterStatus, a.lorStatus, d.under18, d.guardianName, d.guardianPhone, d.guardianConsent ? "Yes" : "No"].map(cell);
}
const E = process.env;
export const googleSheetsConfigured = () => !!(E.GOOGLE_SHEETS_WEBHOOK_URL && E.GOOGLE_SHEETS_WEBHOOK_SECRET);
export const graphConfigured = () => !!(E.MICROSOFT_TENANT_ID && E.MICROSOFT_CLIENT_ID && E.MICROSOFT_CLIENT_SECRET && (E.MICROSOFT_DRIVE_ID || E.MICROSOFT_SITE_ID) && E.MICROSOFT_WORKBOOK_ID);
export async function graphToken() {
  const r = await fetch(`https://login.microsoftonline.com/${E.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, { method: "POST", body: new URLSearchParams({ client_id: E.MICROSOFT_CLIENT_ID!, client_secret: E.MICROSOFT_CLIENT_SECRET!, scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials" }) });
  if (!r.ok) throw new Error(`Graph auth ${r.status}`);
  return (await r.json()).access_token as string;
}
const table = () => `https://graph.microsoft.com/v1.0/${E.MICROSOFT_SITE_ID ? `sites/${E.MICROSOFT_SITE_ID}/drive` : `drives/${E.MICROSOFT_DRIVE_ID}`}/items/${E.MICROSOFT_WORKBOOK_ID}/workbook/tables/${encodeURIComponent(E.MICROSOFT_TABLE_NAME || "Digitics_Internship_Applications")}`;
const gj = async (t: string, url: string, method = "GET", body?: unknown) => {
  const r = await fetch(url, { method, headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(`Graph ${method} ${r.status}`); return r.status === 204 ? null : r.json();
};
export async function appendRow(app: AppRow) {
  if (googleSheetsConfigured()) {
    const r = await fetch(E.GOOGLE_SHEETS_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: E.GOOGLE_SHEETS_WEBHOOK_SECRET, columns: COLUMNS, values: rowFor(app) }),
    });
    if (!r.ok) throw new Error(`Google Sheets ${r.status}`);
    const result = await r.json().catch(() => null) as { ok?: boolean; error?: string } | null;
    if (!result?.ok) throw new Error(`Google Sheets ${result?.error || "invalid response"}`);
    return "google-sheets";
  }
  if (!graphConfigured()) {
    const f = path.join(DATA, "Digitics_Internship_Applications.mock.csv");
    if (!fs.existsSync(f)) fs.writeFileSync(f, COLUMNS.join(",") + "\n");
    fs.appendFileSync(f, rowFor(app).map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n");
    return "mock";
  }
  await gj(await graphToken(), table() + "/rows/add", "POST", { values: [rowFor(app)] });
  return "synced";
}
// Push admin edits (status, notes, ...) back to the same Excel row.
export async function updateRow(app: AppRow) {
  if (!graphConfigured()) return "mock";
  const t = await graphToken();
  const ids = (await gj(t, table() + "/columns/itemAt(index=0)/dataBodyRange?$select=values")).values.flat() as string[];
  const i = ids.indexOf(app.id); if (i < 0) throw new Error("Row not found in Excel table");
  await gj(t, `${table()}/rows/itemAt(index=${i})`, "PATCH", { values: [rowFor(app)] });
  return "synced";
}
