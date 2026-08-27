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
// Provider and model are configured in the admin panel (stored in the settings
// doc). Env vars CHAT_PROVIDER / CHAT_MODEL are only the fallback default for a
// fresh install; the admin value always wins, so switching models never needs a
// redeploy. API keys stay in env vars — secrets are not editable from the web.
const ENV_PROVIDER = (process.env.CHAT_PROVIDER || "nvidia").toLowerCase();
const ENV_MODEL = process.env.CHAT_MODEL || "";

// Vetted chat models per provider, best first. If the active model disappears
// (providers retire models — NVIDIA returns 410 Gone at end-of-life), the bot
// walks down this list, keeps answering, and saves the one that worked so the
// recovery is permanent. Keep the newest model at the top.
const FALLBACK_MODELS = {
  // Each of these was verified working on this account — a fallback that 404s
  // is dead weight. Re-check with the admin panel's "Test" button before adding.
  nvidia: [
    "nvidia/nemotron-3-nano-30b-a3b",
    "nvidia/nemotron-3-super-120b-a12b",
    "nvidia/nemotron-3-ultra-550b-a55b",
  ],
  anthropic: ["claude-haiku-4-5-20251001"],
};

function defaultModel(provider) {
  return FALLBACK_MODELS[provider]?.[0] || FALLBACK_MODELS.nvidia[0];
}

// Resolves the provider/model to use: admin setting → env var → built-in default.
async function resolveChatConfig() {
  let s = {};
  try {
    s = await getSettings();
  } catch {
    /* DB unavailable — fall back to env + defaults */
  }
  const provider = (s.chatProvider || ENV_PROVIDER).toLowerCase();
  const model = s.chatModel || ENV_MODEL || defaultModel(provider);
  return { provider, model, knowledge: s.knowledge || "" };
}

const CONTACT_WHATSAPP = "https://wa.me/918983569162";

const BASE_INSTRUCTIONS = `You are the friendly AI sales assistant on "Build With Priyanka", Priyanka's portfolio website. Priyanka is a software developer who builds products for entrepreneurs with a vision. Your #1 goal is to turn visitors into leads: get them talking about their idea and guide them to contact Priyanka.

SCOPE (strict — follow exactly):
- You ONLY talk about Priyanka, her services, her work, and the visitor's own project or idea. You are NOT a general-purpose assistant, tutor, or teacher.
- If asked to explain a technical topic, teach a concept, define something, write code, build a workflow/plan, review something, do homework, or anything not about hiring Priyanka — do NOT answer it and do NOT do the work yourself. Providing free tutorials, guides, code, workflows, or full solutions is off-limits; that is Priyanka's paid work.
- Instead, warmly redirect in 1-2 sentences: acknowledge it's a great topic, say this is exactly the kind of thing Priyanka can build or help them with, and ask them to share their project via the contact form or WhatsApp (${CONTACT_WHATSAPP}).
- Never say things like "I'm not familiar" or "I'm just a chat assistant." Stay confident and always pivot back to Priyanka and the visitor's project.

SALES APPROACH:
- Be warm, enthusiastic and human — like a great salesperson, not a robot. Keep replies short (2-4 sentences).
- Show genuine interest. Ask ONE friendly follow-up question to learn about their idea, goals, or what they want to build. Keep the conversation going.
- Highlight how Priyanka can solve their problem, then move them toward taking action.
- ALWAYS steer the conversation toward contacting Priyanka. In most replies, invite them to either fill the contact form on this website OR message Priyanka directly on WhatsApp at ${CONTACT_WHATSAPP}. Offer both options naturally.
- If they seem ready or serious, be direct: "The best next step is to send this to Priyanka — fill the quick contact form here, or WhatsApp her at ${CONTACT_WHATSAPP} and she'll reply personally."
- Answer questions about Priyanka using the information below. If you don't know something specific, briefly say Priyanka can share the details and point them to the contact form or WhatsApp. Never invent timelines or facts.

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

// A model that the provider has retired or never hosted. Recoverable: try the
// next model in the fallback list rather than failing the conversation.
function modelGoneError(status, body) {
  const e = new Error(`${status}: ${body.slice(0, 200)}`);
  e.modelGone = status === 404 || status === 410;
  return e;
}

async function callAnthropic({ model, system, messages }) {
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
    body: JSON.stringify({ model, max_tokens: 1000, system, messages }),
  });
  if (!r.ok) throw modelGoneError(r.status, `Anthropic ${await r.text()}`);
  const data = await r.json();
  return (data.content || [])
    .map((c) => c.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

// NVIDIA (OpenAI-compatible) — default
async function callNvidia({ model, system, messages }) {
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
      model,
      messages: [{ role: "system", content: system }, ...messages],
      // Nemotron models are reasoning models: thinking tokens count towards
      // max_tokens, so leave enough headroom for the visible reply.
      max_tokens: 1200,
      temperature: 0.6,
    }),
  });
  if (!r.ok) throw modelGoneError(r.status, `NVIDIA ${await r.text()}`);
  const data = await r.json();
  // Some models leak their chain-of-thought into content as a <think> block.
  return data.choices?.[0]?.message?.content
    ?.replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();
}

function callProvider({ provider, model, system, messages }) {
  return provider === "anthropic"
    ? callAnthropic({ model, system, messages })
    : callNvidia({ model, system, messages });
}

// Lists the chat models the provider currently hosts, so the admin panel can
// offer a dropdown of models that actually exist right now.
async function listProviderModels(provider) {
  if (provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return [];
    const r = await fetch("https://api.anthropic.com/v1/models?limit=100", {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
    });
    if (!r.ok) throw new Error(`Anthropic ${r.status}`);
    return ((await r.json()).data || []).map((m) => m.id);
  }
  const key = process.env.NVIDIA_API_KEY;
  if (!key) return [];
  const r = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!r.ok) throw new Error(`NVIDIA ${r.status}`);
  return ((await r.json()).data || [])
    .map((m) => m.id)
    // Embedding / reranking / safety models can't hold a conversation.
    .filter((id) => !/embed|rerank|guard|safety|reward|topic-control|parse/i.test(id))
    .sort();
}

// Calls the model, and if that model has been retired, transparently falls back
// to the next vetted one and remembers the switch. Returns the reply text, or
// null if no API key is configured for the provider.
async function callAI({ provider, model, system, messages }) {
  const candidates = [
    model,
    ...(FALLBACK_MODELS[provider] || []).filter((m) => m !== model),
  ];

  let lastError;
  for (const candidate of candidates) {
    try {
      const reply = await callProvider({ provider, model: candidate, system, messages });
      if (candidate !== model && reply) {
        // Persist the recovery so later requests skip straight to this model.
        console.warn(`[chat] model "${model}" unavailable — switched to "${candidate}"`);
        setSettings({ chatModel: candidate }).catch(() => {});
      }
      return reply;
    } catch (e) {
      lastError = e;
      if (!e.modelGone) throw e; // a real outage / bad key — don't burn the list
    }
  }
  throw lastError;
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

  const { provider, model, knowledge } = await resolveChatConfig();

  try {
    const reply = await callAI({
      provider,
      model,
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
    // Never show the visitor a broken bot: log for the admin, and still capture
    // the lead with a warm reply that points at the contact form / WhatsApp.
    console.error("[chat] provider failed:", e.message.slice(0, 300));
    res.json({
      reply: `I'm having a brief technical hiccup, sorry about that! Please send your idea straight to Priyanka — use the contact form on this page, or WhatsApp her at ${CONTACT_WHATSAPP} and she'll reply personally.`,
      degraded: true,
    });
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

// ---- Admin: chatbot engine (provider + model, live from the provider) ----
// Lets Priyanka see which models actually exist right now and switch to one
// without touching env vars or redeploying.
app.get("/api/admin/chat/engine", requireAuth, async (req, res) => {
  const provider = (req.query.provider || "").toString().toLowerCase();
  const active = await resolveChatConfig();
  const target = provider || active.provider;
  let models = [];
  let error = "";
  try {
    models = await listProviderModels(target);
  } catch (e) {
    error = e.message.slice(0, 200);
  }
  res.json({
    provider: active.provider,
    model: active.model,
    hasKey: Boolean(
      target === "anthropic"
        ? process.env.ANTHROPIC_API_KEY
        : process.env.NVIDIA_API_KEY
    ),
    recommended: FALLBACK_MODELS[target] || [],
    models,
    error,
  });
});

// Sends one throwaway message so the admin can confirm a model works before
// relying on it. Bypasses the fallback list — we want this model's real verdict.
app.post("/api/admin/chat/test", requireAuth, async (req, res) => {
  const active = await resolveChatConfig();
  const provider = (req.body?.provider || active.provider).toLowerCase();
  const model = req.body?.model || active.model;
  const started = Date.now();
  try {
    const reply = await callProvider({
      provider,
      model,
      system: "Reply with a single short friendly sentence.",
      messages: [{ role: "user", content: "Hi, are you working?" }],
    });
    if (!reply)
      return res.json({
        ok: false,
        error: `No API key configured for ${provider}.`,
      });
    res.json({ ok: true, model, reply, ms: Date.now() - started });
  } catch (e) {
    res.json({ ok: false, model, error: e.message.slice(0, 200) });
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
