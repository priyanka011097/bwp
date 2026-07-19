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
  saveConversation,
  getConversations,
  deleteConversation,
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

// ---- Public: AI chat bot ----
// Provider is chosen with CHAT_PROVIDER ("nvidia" default, or "anthropic").
const CHAT_PROVIDER = (process.env.CHAT_PROVIDER || "nvidia").toLowerCase();
const CHAT_MODEL =
  process.env.CHAT_MODEL ||
  (CHAT_PROVIDER === "anthropic"
    ? "claude-haiku-4-5-20251001"
    : "meta/llama-3.1-8b-instruct");

const CONTACT_WHATSAPP = "https://wa.me/918983569162";

const BASE_INSTRUCTIONS = `You are the friendly AI sales assistant on "Build With Priyanka", Priyanka's portfolio website. Priyanka is a software developer who builds products for entrepreneurs with a vision. Your #1 goal is to turn visitors into leads: get them talking about their idea and guide them to contact Priyanka.

SALES APPROACH:
- Be warm, enthusiastic and human — like a great salesperson, not a robot. Keep replies short (2-4 sentences).
- Show genuine interest. Ask ONE friendly follow-up question to learn about their idea, goals, or what they want to build. Keep the conversation going.
- Highlight how Priyanka can solve their problem, then move them toward taking action.
- ALWAYS steer the conversation toward contacting Priyanka. In most replies, invite them to either fill the contact form on this website OR message Priyanka directly on WhatsApp at ${CONTACT_WHATSAPP}. Offer both options naturally.
- If they seem ready or serious, be direct: "The best next step is to send this to Priyanka — fill the quick contact form here, or WhatsApp her at ${CONTACT_WHATSAPP} and she'll reply personally."
- Answer questions about Priyanka using the information below. If you don't know something specific, say so briefly and point them to the contact form or WhatsApp. Never invent timelines or facts.

PRICING RULE (very important): Whenever anyone asks about budget, money, price, cost, rates, or how much something costs, NEVER say you don't have pricing information and NEVER deflect. Instead, be warm and reassuring: tell them that whatever their budget is, Priyanka can build them something beautiful within it — she works with your budget and fits the project into it. Then invite them to share their budget and idea via the contact form or WhatsApp (${CONTACT_WHATSAPP}) so she can get started. Do not quote specific numbers or invent prices.`;

const DEFAULT_KNOWLEDGE = `Priyanka is a software developer for entrepreneurs, based in Navi Mumbai, India.
Services: AI Automation & Chatbots, Web Development (React, Vite), Mobile & Apps (React Native, PWA), Cloud & APIs (Node.js), Growth & SEO.
Selected work: Pintaboo.com and Proease Global.`;

function buildSystemPrompt(knowledge) {
  const brain = (knowledge && knowledge.trim()) || DEFAULT_KNOWLEDGE;
  return `${BASE_INSTRUCTIONS}\n\n--- What you know about Priyanka ---\n${brain}`;
}

// Best-effort per-IP rate limit. The real hard cap is the provider's own limit.
const chatHits = new Map();
function rateOk(req, max = 15, windowMs = 60000) {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "x";
  const now = Date.now();
  const recent = (chatHits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  chatHits.set(ip, recent);
  return recent.length <= max;
}

// Returns the reply text, or null if no API key is configured.
async function callAI({ system, messages }) {
  if (CHAT_PROVIDER === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      // Anthropic: system is a separate field, messages are user/assistant only
      body: JSON.stringify({ model: CHAT_MODEL, max_tokens: 500, system, messages }),
    });
    if (!r.ok)
      throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const data = await r.json();
    return (data.content || [])
      .map((c) => c.text)
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  // NVIDIA (OpenAI-compatible) — default
  const key = process.env.NVIDIA_API_KEY;
  if (!key) return null;
  const r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    // OpenAI/NVIDIA: system prompt is the first message in the list
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [{ role: "system", content: system }, ...messages],
      max_tokens: 500,
      temperature: 0.6,
    }),
  });
  if (!r.ok)
    throw new Error(`NVIDIA ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content?.trim();
}

app.post("/api/chat", async (req, res) => {
  if (!rateOk(req))
    return res
      .status(429)
      .json({ error: "Too many messages — please slow down a moment." });

  const history = (Array.isArray(req.body?.messages) ? req.body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  if (!history.length) return res.status(400).json({ error: "No messages" });

  const sessionId =
    typeof req.body?.sessionId === "string"
      ? req.body.sessionId.slice(0, 100)
      : "";

  let knowledge = "";
  try {
    ({ knowledge } = await getSettings());
  } catch {
    /* DB unavailable — fall back to default knowledge */
  }

  try {
    const reply = await callAI({
      system: buildSystemPrompt(knowledge),
      messages: history.slice(-20), // only recent turns go to the model
    });
    if (!reply) {
      return res.json({
        reply:
          "The AI bot isn't switched on yet. In the meantime, tell me your idea through the contact form and Priyanka will get right back to you!",
      });
    }

    // Save the full transcript for the admin (best-effort — never block the reply)
    if (sessionId) {
      saveConversation(sessionId, [
        ...history,
        { role: "assistant", content: reply },
      ]).catch(() => {});
    }

    res.json({ reply });
  } catch (e) {
    res
      .status(502)
      .json({ error: "AI unavailable", detail: e.message.slice(0, 200) });
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

// ---- Admin: chatbot conversations ----
app.get("/api/admin/conversations", requireAuth, async (req, res) => {
  try {
    res.json(await getConversations());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/conversations/:id", requireAuth, async (req, res) => {
  try {
    res.json(await deleteConversation(req.params.id));
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
