import PillButton from "./PillButton.jsx";

// Partner section: Dominate 360 (Jivak Dongare) — paid ads & lead generation.
// Figures come from Jivak's Meta Ads Manager / Google Ads accounts.

const STATS = [
  { value: "50+", label: "Clients across healthcare, beauty & local business" },
  { value: "2,010", label: "Google Ads conversions on $7.13k spend" },
  { value: "$4.12", label: "Lowest cost per lead on Meta Ads" },
  { value: "700k+", label: "Ad impressions across Meta & Google" },
];

const RESULTS = [
  {
    tag: "Beauty & Skin Care · Meta Ads",
    title: "Carbon Facial & Hair Treatment",
    kpis: [
      ["385", "Leads"],
      ["$6.75", "Cost per lead"],
    ],
    note: "132,845 impressions on $2,601 spend",
    bg: "#bad6ff",
  },
  {
    tag: "Multi-campaign · Google Ads",
    title: "Google Ads account performance",
    kpis: [
      ["2,010", "Conversions"],
      ["$3.55", "Cost per conversion"],
    ],
    note: "9,580 clicks from 344k impressions",
    bg: "#fae284",
  },
  {
    tag: "Seasonal promo · Meta Ads",
    title: "Ramadan Special lead campaign",
    kpis: [
      ["46", "Leads"],
      ["$4.66", "Cost per lead"],
    ],
    note: "One of the lowest CPLs on record",
    bg: "#ffb0eb",
  },
];

const SERVICES = [
  "Meta Ads",
  "Google Ads",
  "Lead Generation",
  "Conversion Tracking",
  "Local SEO & GMB",
  "Healthcare Marketing",
];

export default function Dominate360() {
  return (
    <section className="d360" id="dominate360">
      <div className="d360__inner">
        <div className="d360__head">
          <p className="d360__label">IN COLLABORATION WITH</p>
          <h2 className="d360__heading">
            Dominate 360 <br/>ads that actually convert.
          </h2>
          <p className="d360__intro">
            Grow faster with AI on your side. Together with Dominate 360, we
            build websites and mobile apps powered by AI, automate the
            repetitive work, and set up CRMs that turn every lead into a
            customer, then run the ads that bring those leads in.
          </p>
          {/* Two copies of the list so the marquee loops seamlessly */}
          <div className="d360__marquee" aria-label={SERVICES.join(", ")}>
            <ul className="d360__tags">
              {[...SERVICES, ...SERVICES].map((s, i) => (
                <li key={i} aria-hidden={i >= SERVICES.length || undefined}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="d360__stats">
          {STATS.map((s) => (
            <div className="d360__stat" key={s.label}>
              <dt>{s.value}</dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>

        <div className="d360__results">
          {RESULTS.map((r) => (
            <article
              className="d360-card"
              style={{ background: r.bg }}
              key={r.title}
            >
              <p className="d360-card__tag">{r.tag}</p>
              <h3 className="d360-card__title">{r.title}</h3>
              <div className="d360-card__kpis">
                {r.kpis.map(([v, l]) => (
                  <div key={l}>
                    <span className="d360-card__val">{v}</span>
                    <span className="d360-card__kpi-label">{l}</span>
                  </div>
                ))}
              </div>
              <p className="d360-card__note">{r.note}</p>
            </article>
          ))}
        </div>

        <div className="d360__cta">
          <PillButton href="#contact">Start your project</PillButton>
        </div>
      </div>
    </section>
  );
}
