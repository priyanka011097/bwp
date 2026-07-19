// ---------------------------------------------------------------------------
// Data store — MongoDB
// ---------------------------------------------------------------------------
// Connection string comes from MONGODB_URI (server/.env).
// Content collections (cases / testimonials / services) are each stored as a
// single document { _id, items: [...] } to preserve order. Enquiries are one
// document per submission.
// ---------------------------------------------------------------------------
import { MongoClient } from "mongodb";
import dns from "dns";

// Some networks can't resolve Atlas SRV records via the default resolver
// (querySrv ECONNREFUSED). Use public DNS servers for the lookup.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  /* ignore */
}

const URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.MONGODB_DB || "bwp";

export const DEFAULTS = {
  cases: [
    {
      id: "c1",
      title: "Pintaboo.com",
      href: "https://pintaboo.com/",
      video: "",
      tags: ["Strategy", "UI / UX", "Web app", "Website"],
    },
    {
      id: "c2",
      title: "Proeaseglobal.com",
      href: "https://proeaseglobal.com/",
      video: "",
      tags: ["Product", "Design", "Cloud"],
    },
  ],
  testimonials: [
    {
      id: "t1",
      quote:
        "I am extremely happy with the website created for Proease Global. Thank you for designing such a beautiful, professional, and user-friendly website with exceptional creativity and attention to detail. You perfectly understood my vision and transformed it into a website that truly reflects my brand.",
      name: "Vinita M",
      company: "Founder, Proease Global",
    },
    {
      id: "t2",
      quote:
        "Priyanka, you have done a great job making this website. The design is very light and easy to use, just as I envisioned it. I look forward to working with you on future projects and will surely recommend you to anybody looking for a trustworthy, efficient, and visionary software developer.",
      name: "Rajesh Das",
      company: "Co-founder, Pintaboo",
    },
    {
      id: "t3",
      quote:
        "Priyanka is an enthusiastic, self-motivated, and one of the most valuable community managers I have ever met — with great leadership skills and excellent knowledge in her field. She is very resourceful and always willing to share. Loved to work with her :)",
      name: "Sowmiya V",
      company: "Growth PM & Community Builder",
    },
    {
      id: "t4",
      quote:
        "Priyanka is a very good employee — I worked with her for nearly 6 months and couldn't find a single bad thing about her. She is very active and a great speaker, and she truly knows how to motivate people, especially students.",
      name: "Mupparaju Priyanka",
      company: "Piping Engineer, KBR",
    },
    {
      id: "t5",
      quote:
        "Priyanka is very talented, energetic, and extremely hardworking. I had a great experience as a co-worker — she is very good at motivating everyone to work hard, and she is so kind. All the best, Priyanka!",
      name: "Jahnavi Akurathi",
      company: "Software Engineer, DXC Technology",
    },
    {
      id: "t6",
      quote:
        "Priyanka is multi-talented and very good with her management skills. She has always worked smartly and put in a lot of hard work with EngineersConnect. I wish her success — God bless and stay connected forever.",
      name: "Bhushan Kumar",
      company: "Founder & CEO, EngineersConnect",
    },
    {
      id: "t7",
      quote:
        "Priyanka has a real curiosity to learn and update her knowledge. She worked as an SEO Intern and kept learning simultaneously. I wish her the best for all future endeavours.",
      name: "Ramu Chelloju",
      company: "Senior DevOps Engineer",
    },
  ],
  services: [
    {
      id: "s1",
      title: "AI Automation & Chatbots",
      desc: "Put AI to work for your business — smart chatbots, assistants, and workflow automations that answer customers, capture leads, and save you hours every week.",
      tags: ["Chatbots", "Automation", "AI"],
    },
    {
      id: "s2",
      title: "Web Development",
      desc: "Fast, accessible, responsive websites and web apps built with modern tools. Clean code that's easy to grow and a pleasure to maintain.",
      tags: ["React", "Vite", "Responsive"],
    },
    {
      id: "s3",
      title: "Mobile & Apps",
      desc: "Cross-platform apps that feel native — from prototype to store launch, without the bloat. One codebase, every device.",
      tags: ["React Native", "PWA", "Stores"],
    },
    {
      id: "s4",
      title: "Cloud & APIs",
      desc: "Scalable backends, clean APIs and cloud infrastructure that grow with your product and your users, without surprise bills.",
      tags: ["Node.js", "APIs", "Cloud"],
    },
    {
      id: "s5",
      title: "Growth & SEO",
      desc: "Performance, analytics and search visibility so the right people actually find — and stay on — your product.",
      tags: ["SEO", "Analytics", "Performance"],
    },
  ],
};

const CONTENT_KEYS = ["cases", "testimonials", "services"];

let clientPromise = null;

async function db() {
  if (!URI) throw new Error("MONGODB_URI not set");
  if (!clientPromise) {
    clientPromise = new MongoClient(URI).connect();
  }
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// Seed content docs on first run if they don't exist yet
async function ensureSeed(database) {
  const col = database.collection("content");
  for (const key of CONTENT_KEYS) {
    const existing = await col.findOne({ _id: key });
    if (!existing) await col.insertOne({ _id: key, items: DEFAULTS[key] });
  }
}

export async function getContent() {
  const database = await db();
  await ensureSeed(database);
  const docs = await database
    .collection("content")
    .find({ _id: { $in: CONTENT_KEYS } })
    .toArray();
  const out = {};
  for (const key of CONTENT_KEYS) {
    const d = docs.find((x) => x._id === key);
    out[key] = d ? d.items : [];
  }
  out.settings = await getSettings();
  return out;
}

// Site settings (single document). Currently holds the resume PDF URL.
export async function getSettings() {
  const database = await db();
  const doc = await database.collection("content").findOne({ _id: "settings" });
  return { resume: doc?.resume || "" };
}

export async function setSettings(patch) {
  const database = await db();
  const allowed = {};
  if (typeof patch.resume === "string") allowed.resume = patch.resume;
  await database
    .collection("content")
    .updateOne({ _id: "settings" }, { $set: allowed }, { upsert: true });
  return getSettings();
}

export async function getCollection(name) {
  const database = await db();
  if (name === "enquiries") {
    return database
      .collection("enquiries")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
  }
  await ensureSeed(database);
  const doc = await database.collection("content").findOne({ _id: name });
  return doc ? doc.items : [];
}

export async function setCollection(name, items) {
  const database = await db();
  await database
    .collection("content")
    .updateOne({ _id: name }, { $set: { items } }, { upsert: true });
  return items;
}

export async function addEnquiry(enquiry) {
  const database = await db();
  await database.collection("enquiries").insertOne({ ...enquiry });
  return enquiry;
}

export async function deleteFrom(name, id) {
  const database = await db();
  if (name === "enquiries") {
    await database.collection("enquiries").deleteOne({ id });
    return getCollection("enquiries");
  }
  return getCollection(name);
}
