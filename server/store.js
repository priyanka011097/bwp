// ---------------------------------------------------------------------------
// Data store
// ---------------------------------------------------------------------------
// This module is the ONLY place that touches persistence. It currently uses a
// local JSON file (server/data/db.json) so everything works out of the box.
//
// >>> To use YOUR database: replace the body of readDB() and writeDB() below
//     with your DB calls (e.g. MongoDB, Postgres, Supabase). Keep the same
//     shape: { enquiries: [], cases: [], testimonials: [], services: [] }.
// ---------------------------------------------------------------------------
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");

const DEFAULTS = {
  enquiries: [],
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
  ],
};

function ensure() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH))
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULTS, null, 2));
}

export function readDB() {
  ensure();
  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  // make sure all collections exist
  return { ...DEFAULTS, ...data };
}

export function writeDB(data) {
  ensure();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Convenience helpers
export function getCollection(name) {
  return readDB()[name] || [];
}

export function setCollection(name, items) {
  const db = readDB();
  db[name] = items;
  writeDB(db);
  return db[name];
}

export function addEnquiry(enquiry) {
  const db = readDB();
  db.enquiries.unshift(enquiry);
  writeDB(db);
  return enquiry;
}

export function deleteFrom(name, id) {
  const db = readDB();
  db[name] = (db[name] || []).filter((x) => x.id !== id);
  writeDB(db);
  return db[name];
}
