import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Digitics Internships", short_name: "Digitics", description: "Apply for an offline creative internship at Digitics.", start_url: "/", display: "standalone", background_color: "#000000", theme_color: "#FCD739", icons: [{ src: "/logo.png", sizes: "any", type: "image/png" }] };
}