import express from "express";
import cors from "cors";
import {
  getContent,
  getCollection,
  setCollection,
  addEnquiry,
  deleteFrom,
  getSettings,
  setSettings,
  saveFile,
  getFile,
} from "./store.js";
import { issueToken, requireAuth } from "./auth.js";
import { OAuth2Client } from "google-auth-library";
import multer from "multer";

// Files are kept in memory then written to MongoDB, so uploads work the same
// locally and on serverless (Vercel), where the filesystem is read-only.
// Note: Vercel caps request bodies at ~4.5 MB, so large videos should be
// pasted as URLs rather than uploaded.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB (fits MongoDB's document limit)
});

const app = express();
const PORT = process.env.PORT || 3001;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ---- Admin: file upload (pdf / image / small video) ----
app.post("/api/admin/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  try {
    const id = await saveFile({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
    });
    res.json({ url: `/api/file/${id}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Public: serve an uploaded file ----
app.get("/api/file/:id", async (req, res) => {
  try {
    const f = await getFile(req.params.id);
    if (!f) return res.status(404).end();
    const buf = f.data?.buffer ? Buffer.from(f.data.buffer) : f.data;
    res.set("Content-Type", f.contentType || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Public: content for the site ----
app.get("/api/content", async (req, res) => {
  try {
    res.json(await getContent());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Public: contact form submission ----
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, idea, budget } = req.body || {};
  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: "Name and email or phone required." });
  }
  const enquiry = {
    id: `e${Date.now()}`,
    name,
    email: email || "",
    phone: phone || "",
    idea: idea || "",
    budget: budget || "",
    createdAt: new Date().toISOString(),
  };
  try {
    await addEnquiry(enquiry);
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Admin auth ----
// ---- Admin auth: Sign in with Google (only) ----
app.post("/api/admin/google", async (req, res) => {
  const { credential } = req.body || {};
  if (!credential || !GOOGLE_CLIENT_ID)
    return res.status(400).json({ error: "Google sign-in not configured" });
  if (!ADMIN_EMAILS.length)
    return res.status(403).json({ error: "No admin emails configured" });
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = (payload.email || "").toLowerCase();
    if (!payload.email_verified || !ADMIN_EMAILS.includes(email))
      return res.status(403).json({ error: "This account is not authorized" });
    res.json({ token: issueToken() });
  } catch {
    res.status(401).json({ error: "Invalid Google token" });
  }
});

// ---- Admin: enquiries ----
app.get("/api/admin/enquiries", requireAuth, async (req, res) => {
  try {
    res.json(await getCollection("enquiries"));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/enquiries/:id", requireAuth, async (req, res) => {
  try {
    res.json(await deleteFrom("enquiries", req.params.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Admin: site settings (resume PDF) ----
app.get("/api/admin/settings", requireAuth, async (req, res) => {
  try {
    res.json(await getSettings());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/admin/settings", requireAuth, async (req, res) => {
  try {
    res.json(await setSettings(req.body || {}));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Admin: content collections (replace whole list) ----
const CONTENT = ["cases", "testimonials", "services"];

app.get("/api/admin/:type", requireAuth, async (req, res) => {
  if (!CONTENT.includes(req.params.type))
    return res.status(404).json({ error: "Unknown collection" });
  try {
    res.json(await getCollection(req.params.type));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/admin/:type", requireAuth, async (req, res) => {
  if (!CONTENT.includes(req.params.type))
    return res.status(404).json({ error: "Unknown collection" });
  const items = Array.isArray(req.body) ? req.body : [];
  try {
    res.json(await setCollection(req.params.type, items));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Only start a listener for local development. On Vercel the app is imported
// as a serverless handler (see /api/[...path].js), so we must not call listen.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
