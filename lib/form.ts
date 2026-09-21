import { z } from "zod";
export const ROLES = { video: "Video Editing", design: "Graphic Designing" } as const;
export type Role = keyof typeof ROLES;
export const EXPERIENCE = ["Beginner / Less than 6 months", "6 months – 1 year", "1–2 years", "2+ years"];
export const RATINGS = ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"];
export const MAX_FILE = 25 * 1024 * 1024;
export const MAX_FILES = 3;
export const ROLE_Q = {
  video: {
    toolsL: "Which video editing software/tools do you use?", tools: ["Adobe Premiere Pro", "Adobe After Effects", "DaVinci Resolve", "Final Cut Pro", "CapCut", "VN", "Other"],
    typesL: "What type of videos have you worked on?", types: ["Instagram Reels", "YouTube Videos", "Short-form Content", "Promotional Videos", "Educational Videos", "Cinematic Videos", "Motion Graphics", "Other"],
    portL: "Share your portfolio, Google Drive, YouTube, Instagram or other demo-work link.", exts: ["mp4", "mov", "pdf", "zip"],
    goodL: "What makes a good video edit?", whyL: "Why do you want to join Digitics as a Video Editing Intern?", skillL: "How would you rate your video editing skills?", expL: "How long have you been doing video editing?",
  },
  design: {
    toolsL: "Which design tools/software do you use?", tools: ["Adobe Photoshop", "Adobe Illustrator", "Canva", "Figma", "Adobe InDesign", "CorelDRAW", "Other"],
    typesL: "What type of designs have you created?", types: ["Social Media Posts", "Posters", "Logos", "Branding", "Thumbnails", "Advertisements", "Presentation Designs", "Marketing Creatives", "Other"],
    portL: "Share your portfolio, Behance, Google Drive, Instagram or other demo-work link.", exts: ["pdf", "png", "jpg", "jpeg", "zip"],
    goodL: "What makes a good graphic design?", whyL: "Why do you want to join Digitics as a Graphic Designing Intern?", skillL: "How would you rate your graphic design skills?", expL: "How long have you been doing graphic design?",
  },
} as const;

const s = z.string().default("");
const S = z.object({
  fullName: s, email: s, phone: s, city: s, location: s, linkedin: s, portfolioSite: s, github: s, under18: s, guardianName: s, guardianPhone: s, guardianConsent: z.boolean().default(false),
  college: s, degree: s, year: s, semester: s, university: s, collegeEmail: s, noc: s, nocReq: s, startDate: s, endDate: s,
  role: s, duration: s, offline: s,
  tools: z.array(z.string()).default([]), experience: s, rating: z.number().default(0), types: z.array(z.string()).default([]),
  client: s, clientDesc: s, portfolio: s, good: s, why: s,
  agreeUnpaid: z.boolean().default(false), agreeAccurate: z.boolean().default(false), privacyAck: z.boolean().default(false), website: s,
});
export type FormValues = z.infer<typeof S>;
const isUrl = (u: string) => { try { return /^https?:$/.test(new URL(u).protocol); } catch { return false; } };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const applicationSchema = S.superRefine((d, c) => {
  const bad = (p: string, m: string) => c.addIssue({ code: "custom", path: [p], message: m });
  const need = (p: keyof FormValues, m: string, min = 1) => { if (String(d[p]).trim().length < min) bad(p, m); };
  need("fullName", "Enter your full name", 2);
  if (!EMAIL.test(d.email)) bad("email", "Enter a valid email address");
  if (!/^\+?[0-9 ()-]{8,16}$/.test(d.phone.trim())) bad("phone", "Enter a valid phone number");
  if (!["Yes", "No"].includes(d.under18)) bad("under18", "Choose one option");
  if (d.under18 === "Yes") {
    need("guardianName", "Enter a guardian name", 2);
    if (!/^\+?[0-9 ()-]{8,16}$/.test(d.guardianPhone.trim())) bad("guardianPhone", "Enter a valid guardian phone number");
    if (!d.guardianConsent) bad("guardianConsent", "Guardian consent is required");
  }
  need("city", "Enter your city"); need("location", "Enter your current location");
  for (const k of ["linkedin", "portfolioSite", "github"] as const) if (d[k] && !isUrl(d[k])) bad(k, "Enter a full link starting with https://");
  need("college", "Enter your college or institution"); need("degree", "Enter your degree or course");
  need("year", "Enter your current year"); need("semester", "Enter your semester"); need("university", "Enter your university or board");
  if (d.collegeEmail && !EMAIL.test(d.collegeEmail)) bad("collegeEmail", "Enter a valid email address");
  if (!["Yes", "No", "Not Sure"].includes(d.noc)) bad("noc", "Choose one option");
  if (d.noc === "Yes") need("nocReq", "Tell us what your college requires", 5);
  const a = Date.parse(d.startDate), b = Date.parse(d.endDate);
  if (isNaN(a)) bad("startDate", "Choose a start date");
  if (isNaN(b)) bad("endDate", "Choose an end date"); else if (!isNaN(a) && b <= a) bad("endDate", "End date must be after the start date");
  if (!(d.role in ROLES)) bad("role", "Choose a role");
  if (!["3 Months", "6 Months"].includes(d.duration)) bad("duration", "Choose a duration");
  if (d.offline !== "Yes") bad("offline", "This internship is offline, so you need to be able to work in person to apply.");
  if (d.role in ROLES) {
    if (!d.tools.length) bad("tools", "Select at least one");
    if (!EXPERIENCE.includes(d.experience)) bad("experience", "Choose one option");
    if (d.rating < 1 || d.rating > 5) bad("rating", "Choose a rating");
    if (!d.types.length) bad("types", "Select at least one");
    if (!["Yes", "No"].includes(d.client)) bad("client", "Choose one option");
    if (d.client === "Yes") need("clientDesc", "Briefly describe the project(s)", 10);
    if (d.portfolio && !isUrl(d.portfolio)) bad("portfolio", "Enter a full link starting with https://");
    need("good", "Tell us a bit more (at least 20 characters)", 20); need("why", "Tell us a bit more (at least 20 characters)", 20);
  }
  if (!d.agreeUnpaid) bad("agreeUnpaid", "Please confirm you understand this is unpaid");
  if (!d.agreeAccurate) bad("agreeAccurate", "Please confirm your information is accurate");
  if (!d.privacyAck) bad("privacyAck", "Please acknowledge the privacy notice");
});

export const STATUSES = ["NEW", "UNDER REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "INTERNSHIP STARTED", "COMPLETED"];
export const ADMIN_OPTS = {
  interviewStatus: ["Not scheduled", "Scheduled", "Completed", "No show"],
  selectionStatus: ["Pending", "Selected", "Waitlisted", "Rejected"],
  completionStatus: ["Not completed", "Completed"],
  certificateStatus: ["Not issued", "Issued"],
  collegeLetterStatus: ["Not requested", "Requested", "Issued"],
  lorStatus: ["Not assessed", "Under consideration", "Issued"],
} as const;
export const ADMIN_DEFAULT = { status: "NEW", interviewStatus: "Not scheduled", selectionStatus: "Pending", internshipStart: "", internshipEnd: "", completionStatus: "Not completed", certificateStatus: "Not issued", collegeLetterStatus: "Not requested", lorStatus: "Not assessed", notes: [] as { at: string; text: string }[] };
export type AdminData = typeof ADMIN_DEFAULT;
export type FileMeta = { name: string; stored: string; size: number };
export type AppRow = { id: string; created: string; data: FormValues & { files: FileMeta[] }; admin: AdminData; excel: string };
