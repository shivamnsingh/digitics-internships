// In-memory limiter: fine for one instance. Use Redis/Upstash if you run several.
const m = new Map<string, number[]>();
export function hit(key: string, max: number, windowMs: number) {
  const now = Date.now(), a = (m.get(key) || []).filter((t) => now - t < windowMs);
  if (a.length >= max) { m.set(key, a); return false; }
  a.push(now); m.set(key, a); return true;
}
