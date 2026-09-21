import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth"; import { listApps, getSetting, getIntake } from "@/lib/db"; import { ROLES, STATUSES, type Role } from "@/lib/form";
import Applicants from "@/components/Applicants"; import { Logout, SettingsForm } from "@/components/AdminControls"; import Logo from "@/components/Logo";
import RetryFailed from "@/components/RetryFailed";
export const dynamic = "force-dynamic"; export const metadata = { title: "Admin — Digitics", robots: { index: false } };
const count = (xs: string[]) => Object.entries(xs.reduce((m: Record<string, number>, x) => ((m[x] = (m[x] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
function Bars({ title, data }: { title: string; data: [string, number][] }) { const max = Math.max(1, ...data.map((d) => d[1]));
  return <div className="glass p-5"><h3 className="text-lg font-bold">{title}</h3><div className="mt-3 space-y-2">{data.map(([k, n]) => <div key={k} className="text-sm"><div className="flex justify-between"><span className="truncate pr-2">{k}</span><span>{n}</span></div><div className="mt-1 h-2 rounded bg-white/10"><div className="h-2 rounded bg-y" style={{ width: `${(n / max) * 100}%` }} /></div></div>)}{!data.length && <p className="text-sm text-white/40">No data yet.</p>}</div></div>; }
export default async function Admin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const apps = await listApps(), n = (s: string) => apps.filter((a) => a.admin.status === s).length;
  const cards: [string, number][] = [["Total Applications", apps.length], ["New Applications", n("NEW")], ["Shortlisted", n("SHORTLISTED")], ["Selected", n("SELECTED")], ["Rejected", n("REJECTED")], ["Currently Interning", n("INTERNSHIP STARTED")], ["Completed", n("COMPLETED")]];
  const rows = apps.map((a) => ({ id: a.id, name: a.data.fullName, role: ROLES[a.data.role as Role], duration: a.data.duration, college: a.data.college, exp: a.data.experience, date: a.created.slice(0, 10), status: a.admin.status }));
  const failed = apps.filter((a) => a.excel.startsWith("error")).length;
  return (<div className="mx-auto max-w-7xl space-y-8 px-5 py-8"><header className="flex items-center justify-between"><div className="flex items-center gap-4"><Logo h={34} /><h1 className="display text-3xl font-extrabold">Admin</h1></div><Logout /></header>
    {failed > 0 && <div className="space-y-3"><p role="alert" className="rounded-xl border border-red-400/50 bg-red-400/10 p-4 text-sm">{failed} application(s) are saved here but failed to sync to Excel. Check the Microsoft credentials; the data is safe in the database.</p><RetryFailed count={failed} /></div>}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">{cards.map(([l, v]) => <div key={l} className="glass p-4"><p className="display text-4xl font-extrabold text-y">{v}</p><p className="mt-1 text-xs text-white/60">{l}</p></div>)}</div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Bars title="Applications by role" data={count(rows.map((r) => r.role))} /><Bars title="Applications by status" data={STATUSES.map((s) => [s, n(s)] as [string, number]).filter((x) => x[1])} /><Bars title="3-month vs 6-month" data={count(rows.map((r) => r.duration))} /><Bars title="Applications by college" data={count(rows.map((r) => r.college)).slice(0, 6)} /><Bars title="Applications over time (by day)" data={count(rows.map((r) => r.date)).sort().slice(-10)} /></div>
    <Applicants rows={rows} /><SettingsForm location={await getSetting("location", process.env.OFFICE_LOCATION || "Location to be announced")} intake={await getIntake()} /></div>);
}
