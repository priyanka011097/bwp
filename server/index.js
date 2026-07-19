import express from "express";
import cors from "cors";
import {
  readDB,
  getCollection,
  setCollection,
  addEnquiry,
  deleteFrom,
} from "./store.js";
import { login, requireAuth } from "./auth.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ---- Public: content for the site ----
app.get("/api/content", (req, res) => {
  const db = readDB();
  res.json({
    cases: db.cases,
    testimonials: db.testimonials,
    services: db.services,
  });
});

// ---- Public: contact form submission ----
app.post("/api/contact", (req, res) => {
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
  addEnquiry(enquiry);
  res.status(201).json({ ok: true });
});

// ---- Admin auth ----
app.post("/api/admin/login", (req, res) => {
  const token = login((req.body || {}).password);
  if (!token) return res.status(401).json({ error: "Wrong password" });
  res.json({ token });
});

// ---- Admin: enquiries ----
app.get("/api/admin/enquiries", requireAuth, (req, res) => {
  res.json(getCollection("enquiries"));
});

app.delete("/api/admin/enquiries/:id", requireAuth, (req, res) => {
  res.json(deleteFrom("enquiries", req.params.id));
});

// ---- Admin: content collections (replace whole list) ----
const CONTENT = ["cases", "testimonials", "services"];

app.get("/api/admin/:type", requireAuth, (req, res) => {
  if (!CONTENT.includes(req.params.type))
    return res.status(404).json({ error: "Unknown collection" });
  res.json(getCollection(req.params.type));
});

app.put("/api/admin/:type", requireAuth, (req, res) => {
  if (!CONTENT.includes(req.params.type))
    return res.status(404).json({ error: "Unknown collection" });
  const items = Array.isArray(req.body) ? req.body : [];
  res.json(setCollection(req.params.type, items));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
