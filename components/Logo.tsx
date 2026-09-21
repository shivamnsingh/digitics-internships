import Link from "next/link";
// The official Digitics logo file, unaltered. It is black-on-white, so it always sits on an off-white tile.
export default function Logo({ h = 40 }: { h?: number }) {
  return (<Link href="/" aria-label="Digitics home" className="inline-flex rounded-xl bg-white px-3 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-y">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo.png" alt="Digitics" style={{ height: h }} className="w-auto" /></Link>);
}
