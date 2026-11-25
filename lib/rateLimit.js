// Simple in-memory limiter. Good enough for a small blog; on serverless each instance has its own counter.
const hits = new Map();
export function limited(key, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
export const ipOf = (req) => (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
