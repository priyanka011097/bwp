import { useEffect, useRef } from "react";
import { useContent } from "../useContent.js";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function ServiceIcon({ name }) {
  switch (name) {
    case "strategy": // person / brand silhouette
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 6a9 9 0 0 1 9 9H11a9 9 0 0 1 9-9Z" />
          <path d="M20 20a10 10 0 0 1 10 10H10a10 10 0 0 1 10-10Z" />
        </svg>
      );
    case "mobile": // app icon
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <rect x="8" y="8" width="24" height="24" rx="7" />
        </svg>
      );
    case "cloud": // overlapping circles
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="13" cy="24" r="8" />
          <circle cx="24" cy="20" r="10" />
          <circle cx="31" cy="25" r="6" />
        </svg>
      );
    case "growth": // ascending bars
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <rect x="7" y="22" width="6" height="11" rx="2" />
          <rect x="17" y="15" width="6" height="18" rx="2" />
          <rect x="27" y="7" width="6" height="26" rx="2" />
        </svg>
      );
    case "web": // brand-style mark
    default:
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M5 6h7a5 5 0 0 1 5 5v22H5z" />
          <path d="M23 6a11 11 0 0 1 11 11H23z" />
          <circle cx="29" cy="27" r="6" />
        </svg>
      );
  }
}

const DEFAULT_SERVICES = [
  {
    icon: "strategy",
    title: "AI Automation & Chatbots",
    desc: "Put AI to work for your business — smart chatbots, assistants, and workflow automations that answer customers, capture leads, and save you hours every week.",
    tags: ["Chatbots", "Automation", "AI"],
    bg: "#bad6ff",
  },
  {
    icon: "web",
    title: "Web Development",
    desc: "Fast, accessible, responsive websites and web apps built with modern tools. Clean code that's easy to grow and a pleasure to maintain.",
    tags: ["React", "Vite", "Responsive"],
    bg: "#ff643d",
  },
  {
    icon: "mobile",
    title: "Mobile & Apps",
    desc: "Cross-platform apps that feel native — from prototype to store launch, without the bloat. One codebase, every device.",
    tags: ["React Native", "PWA", "Stores"],
    bg: "#ffb0eb",
  },
  {
    icon: "cloud",
    title: "Cloud & APIs",
    desc: "Scalable backends, clean APIs and cloud infrastructure that grow with your product and your users, without surprise bills.",
    tags: ["Node.js", "APIs", "Cloud"],
    bg: "#612148",
    dark: true,
  },
  {
    icon: "growth",
    title: "Growth & SEO",
    desc: "Performance, analytics and search visibility so the right people actually find — and stay on — your product.",
    tags: ["SEO", "Analytics", "Performance"],
    bg: "#fae284",
  },
];

export default function Services() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const raw = useContent("services", DEFAULT_SERVICES);
  // keep icon/bg from defaults (by index) for items coming from the API
  const SERVICES = raw.map((s, i) =>
    s.icon ? s : { ...DEFAULT_SERVICES[i % DEFAULT_SERVICES.length], ...s }
  );

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp(-rect.top / total, 0, 1);
      const dist = Math.max(track.scrollWidth - window.innerWidth, 0);
      track.style.transform = `translateX(${-p * dist}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="services" id="services" ref={sectionRef}>
      <div className="services__pin">
        <div className="services__head">
          <p className="services__label">SERVICES</p>
          <h2 className="services__heading">Everything to ship your idea</h2>
        </div>

        <div className="svc-track" ref={trackRef}>
          {SERVICES.map((s) => (
          <article
            className={`svc-card${s.dark ? " svc-card--dark" : ""}`}
            style={{ background: s.bg }}
            key={s.title}
          >
            <div className="svc-card__head">
              <span className="svc-card__icon">
                <ServiceIcon name={s.icon} />
              </span>
              <h3 className="svc-card__title">{s.title}</h3>
            </div>

            <div className="svc-card__body">
              <div className="svc-card__left">
                <p className="svc-card__desc">{s.desc}</p>
                <a className="svc-card__link" href="#contact">
                  Learn more
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path
                      d="M4 12h15M13 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>

              <ul className="svc-card__tags">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </article>
          ))}
        </div>
      </div>
    </section>
  );
}
