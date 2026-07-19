// Minimal token auth (no external deps). Harden with JWT for production.
import crypto from "crypto";

const SECRET = process.env.ADMIN_SECRET || "change-me-secret";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function login(password) {
  if (password !== PASSWORD) return null;
  return sign({ exp: Date.now() + TTL_MS });
}

export function verify(token) {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  if (sig !== expected) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!verify(token)) return res.status(401).json({ error: "Unauthorized" });
  next();
}
