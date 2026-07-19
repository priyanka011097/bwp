import express from "express";
import cors from "cors";
import {
  getContent,
  getCollection,
  setCollection,
  addEnquiry,
  deleteFrom,
} from "./store.js";
import { issueToken, requireAuth } from "./auth.js";
import { OAuth2Client } from "google-auth-library";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
  }),
  limits: { fileSize: 60 * 1024 * 1024 }, // 60 MB
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
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ---- Admin: file upload (video / image) ----
app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
