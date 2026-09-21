import { ROLES, type AppRow, type Role } from "./form";
import { graphConfigured, graphToken } from "./excel";
export async function sendConfirmation(a: AppRow) {
  const sender = process.env.MAIL_SENDER;
  if (!sender || !graphConfigured()) { console.log(`[mail] not configured — confirmation for ${a.id} NOT sent`); return "skipped"; }
  const d = a.data;
  const text = `Hi ${d.fullName},\n\nWe've received your application to Digitics.\n\nApplication ID: ${a.id}\nRole: ${ROLES[d.role as Role]}\nDuration: ${d.duration}\n\nReminder: this is an unpaid, offline internship — no stipend is provided.\nOur team will review your profile and contact shortlisted candidates.\n\nKeep your Application ID for future communication.\n\n— Team Digitics`;
  const r = await fetch(`https://graph.microsoft.com/v1.0/users/${sender}/sendMail`, { method: "POST", headers: { Authorization: `Bearer ${await graphToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { subject: `Digitics Internship Application Received — ${a.id}`, body: { contentType: "Text", content: text }, toRecipients: [{ emailAddress: { address: d.email } }] }, saveToSentItems: true }) });
  if (!r.ok) throw new Error(`mail ${r.status}`); return "sent";
}
