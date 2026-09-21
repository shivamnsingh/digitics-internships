import { SignJWT, jwtVerify } from "jose";
const key = () => { const s = process.env.ADMIN_SESSION_SECRET; if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET missing/too short"); return new TextEncoder().encode(s); };
export const COOKIE = "digitics_admin";
export const sign = () => new SignJWT({ r: "admin" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("8h").sign(key());
export async function verify(t?: string) { if (!t) return false; try { await jwtVerify(t, key()); return true; } catch { return false; } }
