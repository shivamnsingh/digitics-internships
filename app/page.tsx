import Link from "next/link";
import Logo from "@/components/Logo"; import DesignCard from "@/components/DesignCard"; import Timeline from "@/components/Timeline";
import MobileNav from "@/components/MobileNav";
import FloatingApply from "@/components/FloatingApply";
import { getSetting, getIntake } from "@/lib/db";
export const dynamic = "force-dynamic";
const SOCIAL = [["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL], ["LinkedIn", process.env.NEXT_PUBLIC_LINKEDIN_URL], ["YouTube", process.env.NEXT_PUBLIC_YOUTUBE_URL]];
const FAQ = [
  ["Is this internship paid?", "No. This is an unpaid internship. No stipend or monetary compensation is provided."],
  ["Is it online or offline?", "Offline only. You need to be able to work from the Digitics office for the full internship."],
  ["How long is it?", "You choose 3 months or 6 months when you apply."],
  ["Do I need experience or a degree?", "It's open to everyone with no age restriction. What matters is the quality of your work, so share your best portfolio or demo work."],
  ["Will I get a Letter of Recommendation?", "Not automatically. A Letter of Recommendation may be provided for exceptional performance and is not guaranteed."],
  ["My college needs a letter. Can you help?", "Yes. Tell us in the application and, where your college requires it, we can provide a College Internship/Completion Letter."],
  ["What happens after I apply?", "You get an Application ID. Our team reviews your profile and work, and contacts shortlisted candidates. We can't promise a selection or a response time."],
];
export default async function Home() {
  const location = await getSetting("location", process.env.OFFICE_LOCATION || "Location to be announced");
  const intake = await getIntake(), intakeClosed = !intake.open || !!(intake.deadline && intake.deadline < new Date().toISOString().slice(0, 10));
  const Apply = ({ role, children, cls = "btn-y" }: { role?: string; children: React.ReactNode; cls?: string }) => <Link className={cls} href={role ? `/apply?role=${role}` : "/apply"}>{children}</Link>;
  return (<>
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-lg"><nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
      <Logo h={38} />
      <div className="hidden gap-7 text-sm text-white/70 md:flex">{[["Internship", "#internship"], ["Roles", "#roles"], ["Benefits", "#benefits"], ["Process", "#process"], ["FAQ", "#faq"]].map(([l, h]) => <a key={h} href={h} className="hover:text-y">{l}</a>)}</div>
      <div className="flex items-center gap-2"><MobileNav /><Apply cls="btn-y hidden !min-h-11 !py-2 !px-5 text-sm md:inline-flex">Apply now</Apply></div></nav></header>
    <main>
      <div className="spotlight"><section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-24">
        <div>
          <div className="mb-6 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-y px-4 py-1.5 font-bold text-black">UNPAID INTERNSHIP</span><span className="rounded-full border border-white/25 px-4 py-1.5">3 / 6 Month Offline Internship</span></div>
          <h1 className="text-[clamp(3.4rem,10vw,7.5rem)] font-extrabold">Create.<br />Edit.<br />Design.<br /><span className="text-y">Grow.</span></h1>
          <p className="mt-7 max-w-lg text-lg text-white/80">Join Digitics as a creative intern and work on real-world projects in Video Editing or Graphic Design.</p>
          <p className="mt-3 max-w-lg text-white/50">Build real-world experience, strengthen your portfolio and work alongside a creative team.</p>
          <div className="mt-8 flex flex-wrap gap-3">{intakeClosed ? <span className="rounded-xl border border-white/20 px-5 py-3 font-semibold">Applications are currently closed</span> : <Apply><span id="hero-apply">Apply for Internship</span></Apply>}<a href="#roles" className="btn-o">Explore Roles</a></div>
        </div>
        <div className="space-y-4"><div className="flex items-center justify-between px-1 text-sm"><span className="font-semibold">Edit</span><span className="flex items-center gap-2 text-white/50"><i className="rec inline-block h-2 w-2 rounded-full bg-red-500" />REC · real client work</span></div>
          <div data-cursor="Scrub"><Timeline /></div>
          <div className="px-1 pt-2 text-sm font-semibold">Design</div><DesignCard />
          <p className="text-center text-xs text-white/40">Scrub the timeline. Recolour the artboard. That's the job.</p></div>
      </section>
      <div className="overflow-hidden border-y border-black bg-y py-4 text-black" aria-hidden="true"><div className="marquee flex w-max gap-10 whitespace-nowrap">{[0, 1].map((k) => <div key={k} className="display flex gap-10 text-3xl font-extrabold">{["Reels", "Posters", "Motion", "Branding", "Storytelling", "Typography", "Promos", "Social creatives"].map((w) => <span key={w} className="flex items-center gap-10">{w}<i className="inline-block h-3 w-3 rounded-full bg-black" /></span>)}</div>)}</div></div></div>

      <section id="internship" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="text-5xl font-extrabold sm:text-6xl">The internship, plainly.</h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <dl className="divide-y divide-white/10 border-y border-white/10">{[["Type", "Offline"], ["Duration", "3 Months / 6 Months"], ["Compensation", "UNPAID"], ["Eligibility", "Open to everyone"], ["Age", "No age restriction"], ["Roles", "Video Editing / Graphic Designing"], ["Location", location]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-4"><dt className="text-white/50">{k}</dt><dd className={`text-right font-semibold ${v === "UNPAID" ? "rounded bg-y px-2 text-black" : ""}`}>{v}</dd></div>))}</dl>
          <div className="glass p-7"><h3 className="text-3xl font-bold">What you can receive</h3>
            <ol className="mt-5 space-y-4">{["Internship Certificate for every successfully completed intern", "College Internship/Completion Letter where your college requires it", "Letter of Recommendation for exceptional performance"].map((t, i) => <li key={t} className="flex gap-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-y text-sm font-bold text-black">{i + 1}</span>{t}</li>)}</ol>
            <p className="mt-6 rounded-xl border border-y/40 bg-y/10 p-4 text-sm text-y">LORs are performance-based and are not guaranteed to every intern.</p></div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="text-5xl font-extrabold sm:text-6xl">Pick your craft.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[{ k: "video", t: "Video Editing", items: ["Short-form content", "Social media videos", "Reels", "Promotional videos", "Storytelling", "Motion/visual editing"], cta: "Apply for Video Editing", art: <div className="flex h-full items-end gap-1">{[40, 70, 55, 90, 35, 65, 80, 50].map((h, i) => <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-sm bg-black/80" />)}</div> },
            { k: "design", t: "Graphic Designing", items: ["Social media creatives", "Posters", "Branding assets", "Marketing creatives", "Typography", "Visual communication"], cta: "Apply for Graphic Designing", art: <div className="grid h-full grid-cols-4 grid-rows-3 gap-1">{Array.from({ length: 12 }, (_, i) => <div key={i} className={`bg-black/80 ${i % 5 === 0 ? "rounded-full" : i % 3 === 0 ? "rounded-tr-3xl" : "rounded-sm"}`} />)}</div> }].map((r) => (
            <article key={r.k} data-cursor="Apply" className="group glass flex flex-col overflow-hidden p-0 transition hover:border-y/60">
              <div className="h-36 bg-y p-4" aria-hidden="true">{r.art}</div>
              <div className="flex flex-1 flex-col p-7"><h3 className="text-4xl font-extrabold">{r.t}</h3>
                <ul className="mt-5 flex flex-wrap gap-2">{r.items.map((i) => <li key={i} className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/80">{i}</li>)}</ul>
                <div className="mt-8"><Apply role={r.k}>{r.cta}</Apply></div></div></article>))}
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="text-5xl font-extrabold sm:text-6xl">What you take with you.</h2>
        <div className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">{[["Real projects", "Work on content that actually gets published, not practice files."], ["A stronger portfolio", "Leave with finished pieces you can show."], ["A creative team", "Sit next to editors and designers and learn how work gets made."], ["Recognition that's earned", "A certificate on completion; a recommendation for exceptional work."]].map(([t, d]) => <div key={t} className="border-l-2 border-y pl-5"><h3 className="text-2xl font-bold">{t}</h3><p className="mt-2 text-white/60">{d}</p></div>)}</div>
      </section>

      <section id="process" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="text-5xl font-extrabold sm:text-6xl">Four steps.</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">{[["Apply", "Submit your application and portfolio."], ["Review", "Digitics reviews your profile and work."], ["Selection", "Shortlisted candidates are contacted."], ["Internship", "Work on real projects and build your experience."]].map(([t, d], i) => (
          <li key={t} className="relative border-t-2 border-y pt-5"><span className="display text-6xl font-extrabold text-y">{String(i + 1).padStart(2, "0")}</span><h3 className="mt-3 text-2xl font-bold">{t}</h3><p className="mt-2 text-white/60">{d}</p></li>))}</ol>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
        <h2 className="text-5xl font-extrabold sm:text-6xl">Questions.</h2>
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">{FAQ.map(([q, a]) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold marker:hidden"><span>{q}</span><span className="text-2xl text-y transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-xl text-white/65">{a}</p></details>)}</div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24"><div className="rounded-3xl bg-y p-10 text-black sm:p-16"><h2 className="text-5xl font-extrabold sm:text-7xl">Ready to make something?</h2><p className="mt-4 max-w-md font-medium">It's an unpaid, offline internship. Applying takes about ten minutes.</p><div className="mt-8"><Link href="/apply" className="btn bg-black text-white hover:bg-white hover:text-black"><span id="footer-apply">Apply for Internship</span></Link></div></div></section>
    </main><FloatingApply />
    <footer className="border-t border-white/10"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1fr_auto_auto]">
      <div><Logo h={44} /><p className="display mt-5 text-2xl font-bold">Create. Edit. Design. Grow.</p></div>
      <nav aria-label="Footer" className="flex flex-col gap-2 text-white/70">{[["Home", "/"], ["Internship", "/#internship"], ["Roles", "/#roles"], ["FAQ", "/#faq"], ["Status", "/status"], ["Privacy", "/privacy"], ["Apply", "/apply"]].map(([l, h]) => <Link key={l} href={h} className="hover:text-y">{l}</Link>)}</nav>
      <div className="flex flex-col gap-2 text-white/70">{SOCIAL.map(([l, u]) => <a key={l} href={u || "#"} className="hover:text-y" {...(u ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{l}</a>)}</div>
    </div><p className="border-t border-white/10 py-5 text-center text-sm text-white/40">© 2026 Digitics. All rights reserved.</p></footer>
  </>);
}
