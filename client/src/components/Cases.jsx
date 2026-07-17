import { useEffect, useRef, useState } from "react";
import pintaboo from "../assets/pintaboo.mp4";
import proeaseglobal from "../assets/proeaseglobal.mp4";

function TagIcon({ name }) {
  switch (name) {
    case "science": // 4-point sparkle
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 0c.6 5 4.4 8.9 10 10-5.6 1.1-9.4 5-10 10-.6-5-4.4-8.9-10-10C5.6 8.9 9.4 5 10 0Z" />
        </svg>
      );
    case "identity": // swirl / S
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M14 4.5A3.5 3.5 0 0 0 6.5 7 3.5 3.5 0 0 0 10 10.5 3.5 3.5 0 0 1 13.5 14 3.5 3.5 0 0 1 6 15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "print": // 8-spoke burst
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M10 2v16M2 10h16M4.3 4.3l11.4 11.4M15.7 4.3 4.3 15.7" />
          </g>
        </svg>
      );
    case "web": // brand-style mark
    default:
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M0 0h4a4 4 0 0 1 4 4v16H0z" />
          <path d="M12 0a8 8 0 0 1 8 8h-8z" />
          <circle cx="16" cy="16" r="4" />
        </svg>
      );
  }
}

const CASES = [
  {
    title: "Pintaboo.com",
    src: pintaboo,
    href: "https://pintaboo.com/",
    tags: [
      { icon: "science", label: "Strategy" },
      { icon: "identity", label: "UI / UX" },
      { icon: "print", label: "Web app" },
      { icon: "web", label: "Website" },
    ],
  },
  {
    title: "Proeaseglobal.com",
    src: proeaseglobal,
    href: "https://proeaseglobal.com/",
    tags: [
      { icon: "science", label: "Product" },
      { icon: "identity", label: "Design" },
      { icon: "web", label: "Cloud" },
    ],
  },
];

// 8 overlapping petals + center form the cloud/flower shape
const PETALS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return { cx: 80 + 30 * Math.cos(a), cy: 80 + 30 * Math.sin(a) };
});

export default function Cases() {
  const cursorRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      const el = cursorRef.current;
      if (el)
        el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="cases" id="work">
      <div className="cases__head">
        <p className="cases__label">RECENT</p>
        <h2 className="cases__heading">eCommerce Websites I Build</h2>
      </div>

      <div className="cases__grid">
        {CASES.map((c) => (
          <a
            className="case-card"
            href={c.href}
            key={c.title}
            {...(c.href?.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <div
              className="case-card__media"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
            >
              <video
                src={c.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>

            <h3 className="case-card__title">{c.title}</h3>
            <ul className="case-card__tags">
              {c.tags.map((t) => (
                <li className="case-tag" key={t.label}>
                  <TagIcon name={t.icon} />
                  <span>{t.label}</span>
                </li>
              ))}
            </ul>
          </a>
        ))}
      </div>

      <div className="cases__more">
        <a className="cases-btn" href="#work">
          <span className="cases-btn__circle cases-btn__circle--left">
            <svg viewBox="0 0 24 24">
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="cases-btn__pill">See all work</span>
          <span className="cases-btn__circle cases-btn__circle--right">
            <svg viewBox="0 0 24 24">
              <path
                d="M4 12h15M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>

      {/* Custom "SHOW CASE" cursor that follows the pointer over the cards */}
      <div
        className={`case-cursor${active ? " is-visible" : ""}`}
        ref={cursorRef}
        aria-hidden="true"
      >
        <svg className="case-cursor__blob" viewBox="0 0 160 160">
          {PETALS.map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r="24" />
          ))}
          <circle cx="80" cy="80" r="32" />
        </svg>

        <svg className="case-cursor__ring" viewBox="0 0 160 160">
          <defs>
            <path
              id="cc-ring"
              d="M80,80 m-63,0 a63,63 0 1,1 126,0 a63,63 0 1,1 -126,0"
            />
          </defs>
          <text>
            <textPath href="#cc-ring" startOffset="0">
              SHOW CASE • SHOW CASE •&nbsp;
            </textPath>
          </text>
        </svg>

        <svg className="case-cursor__arrow" viewBox="0 0 24 24">
          <path
            d="M7 17L17 7M17 7H8M17 7V16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
