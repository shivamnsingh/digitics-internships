import Link from "next/link"; import Logo from "@/components/Logo"; import SuccessActions from "@/components/SuccessActions";
export const metadata = { title: "Application received — Digitics" };
export default function Success({ searchParams }: { searchParams: { id?: string } }) {
  const id = /^DIG-\d{4}-\d{4,}$/.test(searchParams.id || "") ? searchParams.id : null;
  return (<main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-12"><Logo h={38} />
    <h1 className="mt-10 text-5xl font-extrabold sm:text-6xl">Application Submitted Successfully!</h1>
    <p className="mt-4 text-lg text-white/80">Thank you for applying to Digitics.</p>
    {id && <div className="mt-8 rounded-2xl bg-y p-6 text-black"><p className="text-sm font-semibold">Your Application ID is:</p><p className="display mt-1 break-all text-4xl font-extrabold sm:text-5xl">{id}</p><SuccessActions id={id} /></div>}
    <p className="mt-6 font-semibold">Keep this Application ID for future communication.</p>
    <p className="mt-3 text-white/65">Your application has been received. Our team will review your profile and contact shortlisted candidates.</p>
    <p className="mt-3 text-sm text-white/45">This is an unpaid internship. A confirmation email is sent only when email is configured on our side.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Link href="/status" className="btn-y">Check status</Link><Link href="/" className="btn-o">Back to home</Link></div></main>);
}
