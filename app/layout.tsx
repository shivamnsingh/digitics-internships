import "./globals.css";
import Cursor from "@/components/Cursor";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = { title: "Digitics Internships — Video Editing & Graphic Designing", description: "Offline, unpaid creative internships at Digitics. Apply for Video Editing or Graphic Designing." };
export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap" />
  </head><body>{children}<Cursor /></body></html>);
}
