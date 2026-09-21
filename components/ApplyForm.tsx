"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applicationSchema, ROLES, ROLE_Q, EXPERIENCE, RATINGS, MAX_FILE, MAX_FILES, type FormValues, type Role } from "@/lib/form";

const EMPTY: FormValues = { fullName: "", email: "", phone: "", city: "", location: "", linkedin: "", portfolioSite: "", github: "", under18: "", guardianName: "", guardianPhone: "", guardianConsent: false, college: "", degree: "", year: "", semester: "", university: "", collegeEmail: "", noc: "", nocReq: "", startDate: "", endDate: "", role: "", duration: "", offline: "", tools: [], experience: "", rating: 0, types: [], client: "", clientDesc: "", portfolio: "", good: "", why: "", agreeUnpaid: false, agreeAccurate: false, privacyAck: false, website: "" };
const STEPS = ["Personal", "Education", "Preference", "Skills", "Review", "Submit"];
const KEYS: string[][] = [
  ["fullName", "email", "phone", "city", "location", "linkedin", "portfolioSite", "github", "under18", "guardianName", "guardianPhone", "guardianConsent"],
  ["college", "degree", "year", "semester", "university", "collegeEmail", "noc", "nocReq", "startDate", "endDate"],
  ["role", "duration", "offline"],
  ["tools", "experience", "rating", "types", "client", "clientDesc", "portfolio", "good", "why", "files"],
  [], ["agreeUnpaid", "agreeAccurate", "privacyAck"],
];
const DRAFT = "digitics_draft_v1";

export default function ApplyForm() {
  const router = useRouter(), qs = useSearchParams();
  const [v, setV] = useState<FormValues>(EMPTY), [step, setStep] = useState(0), [e, setE] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]), [busy, setBusy] = useState(false), [srv, setSrv] = useState(""), [ready, setReady] = useState(false), [restored, setRestored] = useState(false);

  useEffect(() => { // restore draft (text answers only; files can't be stored in the browser)
    try { const d = JSON.parse(localStorage.getItem(DRAFT) || "null"); if (d) { setV({ ...EMPTY, ...d.v }); setStep(d.step || 0); setRestored(true); } } catch {}
    const r = qs.get("role"); if (r && r in ROLES) setV((x) => (x.role ? x : { ...x, role: r }));
    setReady(true);
  }, [qs]);
  useEffect(() => { if (ready) try { localStorage.setItem(DRAFT, JSON.stringify({ v, step })); } catch {} }, [v, step, ready]);

  const role = v.role in ROLES ? (v.role as Role) : null, Q = role ? ROLE_Q[role] : null;
  const set = <K extends keyof FormValues>(k: K, x: FormValues[K]) => { setV((p) => ({ ...p, [k]: x })); setE((p) => { const { [k]: _, ...r } = p; return r; }); };
  const errsFor = (s: number) => { const r = applicationSchema.safeParse(v), o: Record<string, string> = {}; if (!r.success) for (const i of r.error.issues) { const k = String(i.path[0]); if (KEYS[s].includes(k) && !o[k]) o[k] = i.message; } return o; };
  const next = () => { const o = errsFor(step); setE(o); if (Object.keys(o).length) { document.getElementById(Object.keys(o)[0])?.focus(); return; } setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = () => { setStep(step - 1); window.scrollTo({ top: 0 }); };
  const pickRole = (r: string) => setV((p) => ({ ...p, role: r, tools: [], types: [], experience: "", rating: 0, client: "", clientDesc: "", portfolio: "", good: "", why: "" })), clearFiles = () => setFiles([]);

  const onFiles = (list: FileList | null) => {
    const f = Array.from(list || []); if (!Q) return;
    const bad = f.find((x) => !(Q.exts as readonly string[]).includes(x.name.split(".").pop()!.toLowerCase())) ? `Allowed formats: ${Q.exts.join(", ").toUpperCase()}` : f.some((x) => x.size > MAX_FILE) ? `Each file must be under ${MAX_FILE / 1048576} MB` : f.length > MAX_FILES ? `Up to ${MAX_FILES} files` : "";
    if (bad) { setE((p) => ({ ...p, files: bad })); return; }
    setE((p) => { const { files: _, ...r } = p; return r; }); setFiles(f);
  };

  async function submit() {
    if (busy) return;
    const r = applicationSchema.safeParse(v);
    if (!r.success) { const o: Record<string, string> = {}; for (const i of r.error.issues) o[String(i.path[0])] ||= i.message; setE(o); const s = KEYS.findIndex((k) => k.includes(Object.keys(o)[0])); if (s >= 0) setStep(s); return; }
    setBusy(true); setSrv("");
    const fd = new FormData(); fd.append("payload", JSON.stringify(v)); files.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/apply", { method: "POST", body: fd }), j = await res.json().catch(() => ({}));
      if (res.ok) { localStorage.removeItem(DRAFT); router.push(`/apply/success?id=${encodeURIComponent(j.id)}`); return; } // stay "busy" while redirecting: no double submit
      if (j.fields) { setE(j.fields); const s = KEYS.findIndex((k) => k.includes(Object.keys(j.fields)[0])); if (s >= 0) setStep(s); }
      setSrv(j.error || "Something went wrong."); setBusy(false);
    } catch { setSrv("Network problem. Your answers are saved on this device. Please try again."); setBusy(false); }
  }

  // ---- field helpers (plain functions, not components, so inputs keep focus) ----
  const field = (l: string, k: string, node: React.ReactNode, opt = false) => (<div key={k}><label htmlFor={k} className="mb-2 block text-sm font-semibold">{l}{opt && <span className="font-normal text-white/40"> (optional)</span>}</label>{node}{e[k] && <p role="alert" className="mt-1.5 text-sm text-red-400">{e[k]}</p>}</div>);
  const txt = (k: keyof FormValues, l: string, type = "text", opt = false, ph = "") => field(l, k, <input id={k} type={type} className="input" placeholder={ph} value={String(v[k])} onChange={(x) => set(k, x.target.value as never)} aria-invalid={!!e[k]} autoComplete={k === "fullName" ? "name" : k === "email" ? "email" : k === "phone" ? "tel" : undefined} />, opt);
  const area = (k: keyof FormValues, l: string, rows = 4) => field(l, k, <textarea id={k} rows={rows} className="input" value={String(v[k])} onChange={(x) => set(k, x.target.value as never)} aria-invalid={!!e[k]} />);
  const one = (k: keyof FormValues, l: string, opts: readonly string[], onPick?: (o: string) => void) => (<div key={k}><fieldset><legend id={k} tabIndex={-1} className="mb-2 text-sm font-semibold">{l}</legend><div className="flex flex-wrap gap-2">{opts.map((o) => <label key={o} className="chip"><input type="radio" name={k} className="sr-only" checked={(k === "role" ? (role ? ROLES[role] : "") : v[k]) === o} onChange={() => (onPick ? onPick(o) : set(k, o as never))} />{o}</label>)}</div></fieldset>{e[k] && <p role="alert" className="mt-1.5 text-sm text-red-400">{e[k]}</p>}</div>);
  const many = (k: "tools" | "types", l: string, opts: readonly string[]) => (<div key={k}><fieldset><legend id={k} tabIndex={-1} className="mb-2 text-sm font-semibold">{l}</legend><div className="flex flex-wrap gap-2">{opts.map((o) => <label key={o} className="chip"><input type="checkbox" className="sr-only" checked={v[k].includes(o)} onChange={() => set(k, v[k].includes(o) ? v[k].filter((x) => x !== o) : [...v[k], o])} />{o}</label>)}</div></fieldset>{e[k] && <p role="alert" className="mt-1.5 text-sm text-red-400">{e[k]}</p>}</div>);

  const today = new Date().toISOString().slice(0, 10);
  const body = [
    <div key="0" className="grid gap-5 sm:grid-cols-2">{txt("fullName", "Full name")}{txt("email", "Email address", "email")}{txt("phone", "Phone number", "tel")}{txt("city", "City")}<div className="sm:col-span-2">{txt("location", "Current location", "text", false, "Area / locality where you live now")}</div><div className="sm:col-span-2">{one("under18", "Are you under 18?", ["Yes", "No"])}</div>{v.under18 === "Yes" && <><div>{txt("guardianName", "Guardian full name")}</div><div>{txt("guardianPhone", "Guardian phone number", "tel")}</div><div className="sm:col-span-2"><label className="flex min-h-11 cursor-pointer items-start gap-3"><input id="guardianConsent" type="checkbox" className="mt-1 h-5 w-5 accent-[#FCD739]" checked={v.guardianConsent} onChange={(x) => set("guardianConsent", x.target.checked)} /><span>I confirm that my guardian has consented to this application.</span></label>{e.guardianConsent && <p role="alert" className="mt-1 text-sm text-red-400">{e.guardianConsent}</p>}</div></>}{txt("linkedin", "LinkedIn profile", "url", true, "https://")}{txt("portfolioSite", "Portfolio website", "url", true, "https://")}{txt("github", "GitHub profile", "url", true, "https://")}<input tabIndex={-1} aria-hidden="true" autoComplete="off" className="absolute -left-[9999px] h-px w-px" name="website" value={v.website} onChange={(x) => set("website", x.target.value)} /></div>,
    <div key="1" className="grid gap-5 sm:grid-cols-2">{txt("college", "College / Institution name")}{txt("degree", "Degree / Course")}{txt("year", "Current year", "text", false, "e.g. 2nd year")}{txt("semester", "Semester", "text", false, "e.g. 4")}{txt("university", "University / Board")}{txt("collegeEmail", "College email", "email", true)}
      <div className="sm:col-span-2">{one("noc", "Does your college require an internship/NOC letter?", ["Yes", "No", "Not Sure"])}</div>
      {v.noc === "Yes" && <div className="sm:col-span-2">{area("nocReq", "What internship/NOC requirements does your college have?", 3)}</div>}
      {field("Expected internship start date", "startDate", <input id="startDate" type="date" min={today} className="input" value={v.startDate} onChange={(x) => set("startDate", x.target.value)} />)}{field("Expected internship end date", "endDate", <input id="endDate" type="date" min={v.startDate || today} className="input" value={v.endDate} onChange={(x) => set("endDate", x.target.value)} />)}</div>,
    <div key="2" className="space-y-7">{one("role", "Which role are you applying for?", Object.values(ROLES), (o) => { pickRole(Object.keys(ROLES)[Object.values(ROLES).indexOf(o as never)]); clearFiles(); })}
      {/* radios show labels; value maps back to role key */}
      {one("duration", "Preferred internship duration?", ["3 Months", "6 Months"])}{one("offline", "Are you comfortable with an offline internship?", ["Yes", "No"])}
      {v.offline === "No" && <div role="alert" className="rounded-xl border border-red-400/50 bg-red-400/10 p-4 text-sm">This internship is <b>offline</b> and takes place in person at the Digitics office. Because it can't be done remotely, we can't take your application forward. If your situation changes, you're welcome to come back.</div>}</div>,
    Q ? <div key="3" className="space-y-7">{many("tools", Q.toolsL, Q.tools)}{one("experience", Q.expL, EXPERIENCE)}
      <div><fieldset><legend id="rating" tabIndex={-1} className="mb-2 text-sm font-semibold">{Q.skillL}</legend><div className="grid grid-cols-5 gap-2">{RATINGS.map((n, i) => <label key={n} className="chip flex-col !rounded-xl !px-1 text-center"><input type="radio" name="rating" className="sr-only" checked={v.rating === i + 1} onChange={() => set("rating", i + 1)} /><b className="text-lg">{i + 1}</b><span className="text-[11px] leading-tight">{n}</span></label>)}</div></fieldset>{e.rating && <p role="alert" className="mt-1.5 text-sm text-red-400">{e.rating}</p>}</div>
      {many("types", Q.typesL, Q.types)}{one("client", "Have you worked on real/client projects before?", ["Yes", "No"])}{v.client === "Yes" && area("clientDesc", "Briefly describe the project(s).", 3)}
      {txt("portfolio", Q.portL, "url", true, "https://")}
      {field(`Upload sample work (${Q.exts.join(", ").toUpperCase()}; up to ${MAX_FILES} files, ${MAX_FILE / 1048576} MB each)`, "files", <input id="files" type="file" multiple accept={Q.exts.map((x) => "." + x).join(",")} onChange={(x) => onFiles(x.target.files)} className="input file:mr-4 file:rounded-full file:border-0 file:bg-y file:px-4 file:py-1.5 file:font-semibold file:text-black" />, true)}
      {files.length > 0 && <p className="text-sm text-white/60">{files.map((f) => f.name).join(", ")}</p>}
      {area("good", Q.goodL)}{area("why", Q.whyL)}</div> : <p key="3">Go back and choose a role first.</p>,
    <dl key="4" className="divide-y divide-white/10 border-y border-white/10 text-sm">{[["Name", v.fullName], ["Email", v.email], ["Phone", v.phone], ["College", `${v.college} — ${v.degree}, ${v.year}`], ["Role", role ? ROLES[role] : ""], ["Duration", v.duration], ["Tools", v.tools.join(", ")], ["Portfolio", v.portfolio || "Not provided"], ["Files", files.map((f) => f.name).join(", ") || "None"]].map(([k, x]) => <div key={k} className="flex justify-between gap-6 py-3"><dt className="text-white/50">{k}</dt><dd className="break-all text-right">{x}</dd></div>)}</dl>,
    <div key="5" className="space-y-6">
      <div className="rounded-2xl border-2 border-y bg-y/10 p-6"><h3 className="text-2xl font-extrabold text-y">IMPORTANT — PLEASE READ</h3><div className="mt-3 space-y-2 text-sm text-white/85"><p><b>This is an unpaid internship opportunity. No stipend or monetary compensation will be provided during the internship.</b></p><p>Successful completion of the internship may result in an Internship Certificate and, where required, a College Internship/Completion Letter.</p><p>A Letter of Recommendation may be provided based on exceptional performance and is not guaranteed.</p></div></div>
      {([["agreeUnpaid", "I understand that this is an unpaid internship."], ["agreeAccurate", "I confirm that the information provided in this application is accurate."], ["privacyAck", "I acknowledge the privacy notice for this application."]] as const).map(([k, l]) => <div key={k}><label className="flex cursor-pointer items-start gap-3"><input id={k} type="checkbox" className="mt-1 h-5 w-5 accent-[#FCD739]" checked={v[k]} onChange={(x) => set(k, x.target.checked)} /><span>{k === "privacyAck" ? <>{l} <a className="text-y underline" href="/privacy" target="_blank" rel="noreferrer">Read the placeholder notice</a></> : l}</span></label>{e[k] && <p role="alert" className="mt-1 text-sm text-red-400">{e[k]}</p>}</div>)}
      {srv && <p role="alert" className="rounded-xl border border-red-400/50 bg-red-400/10 p-4 text-sm">{srv}</p>}</div>,
  ];

  if (!ready) return <div className="mx-auto max-w-2xl px-5 pb-32 pt-10" aria-busy="true"><p className="text-white/60">Loading your saved application...</p></div>;
  return (<div className="mx-auto max-w-2xl scroll-pb-32 px-5 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-10">
    <h1 className="text-5xl font-extrabold sm:text-6xl">Apply to Digitics</h1>
    <p className="mt-3 text-white/60">Unpaid · Offline · 3 or 6 months</p>
    <ol className="mt-8 flex gap-1.5" aria-label="Progress">{STEPS.map((s, i) => <li key={s} className="flex-1" aria-current={i === step ? "step" : undefined}><div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-y" : "bg-white/15"}`} /><span className={`mt-2 hidden text-xs sm:block ${i === step ? "text-y" : "text-white/40"}`}>{String(i + 1).padStart(2, "0")} {s}</span></li>)}</ol>
    <p className="mt-3 text-sm text-y sm:hidden">Step {step + 1} of 6 · {STEPS[step]}</p>
    {restored && step > 0 && <p className="mt-4 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70">We restored your saved answers. Sample files need to be re-attached.</p>}
    <div className="mt-8 min-h-[16rem]">{body[step]}</div>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg"><div className="mx-auto flex min-h-16 max-w-2xl justify-between gap-3 px-5 py-3">
      <button type="button" onClick={back} disabled={step === 0 || busy} className="btn-o">Back</button>
      {step < 5 ? <button type="button" onClick={next} disabled={step === 2 && v.offline === "No"} className="btn-y flex-1 sm:flex-none">Continue</button>
        : <button type="button" onClick={submit} disabled={busy} className="btn-y flex-1 sm:flex-none">{busy ? "Submitting your application..." : "Submit Application"}</button>}</div></div>
  </div>);
}
