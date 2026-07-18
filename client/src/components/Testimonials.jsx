import { useEffect, useRef } from "react";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const QUOTES = [
  {
    quote:
      "I am extremely happy with the website created for Proease Global. Thank you for designing such a beautiful, professional, and user-friendly website with exceptional creativity and attention to detail. You perfectly understood my vision and transformed it into a website that truly reflects my brand. What impressed me most was the speed of delivery without compromising on quality — every interaction was smooth, effortless, and highly professional. I highly recommend your services to anyone looking for a creative, reliable, and dedicated web designer!",
    name: "Vinita M",
    company: "Founder, Proease Global",
    filled: true,
  },
  {
    quote:
      "Priyanka, you have done a great job making this website. The design is very light and easy to use, just as I envisioned it. The way you understood the assignment and delivered exactly what the brand needed impressed me. I look forward to working with you on future projects and will surely recommend you to anybody looking for a trustworthy, efficient, and visionary software developer. Kudos for the fantastic job you did!",
    name: "Rajesh Das",
    company: "Co-founder, Pintaboo",
  },
  {
    quote:
      "Priyanka is an enthusiastic, self-motivated, and one of the most valuable community managers I have ever met — with great leadership skills and excellent knowledge in her field. She is very resourceful and always willing to share, with a positive, hands-on approach, explaining everything practically and clearly. Loved to work with her :)",
    name: "Sowmiya V",
    company: "Growth PM & Community Builder",
  },
  {
    quote:
      "Priyanka is a very good employee — I worked with her for nearly 6 months and couldn't find a single bad thing about her. She is very active and a great speaker. Her motivation can make people do the impossible, and she truly knows how to motivate people, especially students.",
    name: "Mupparaju Priyanka",
    company: "Piping Engineer, KBR",
  },
  {
    quote:
      "Priyanka is very talented, energetic, and extremely hardworking. I had a great experience as a co-worker — she is very good at motivating everyone to work hard, and she is so kind. All the best, Priyanka!",
    name: "Jahnavi Akurathi",
    company: "Software Engineer, DXC Technology",
  },
  {
    quote:
      "Priyanka is multi-talented and very good with her management skills. She has always worked smartly and put in a lot of hard work with EngineersConnect. I wish her success — God bless and stay connected forever.",
    name: "Bhushan Kumar",
    company: "Founder & CEO, EngineersConnect",
  },
  {
    quote:
      "Priyanka has a real curiosity to learn and update her knowledge. She worked as an SEO Intern and kept learning simultaneously. I wish her the best for all future endeavours.",
    name: "Ramu Chelloju",
    company: "Senior DevOps Engineer",
  },
];

function QuoteMark() {
  return (
    <svg className="tst-card__mark" viewBox="0 0 40 32" aria-hidden="true">
      <path d="M0 32V18C0 8 6 2 16 0v6C10 8 8 12 8 16h6v16H0zm22 0V18C22 8 28 2 38 0v6c-6 2-8 6-8 10h6v16H22z" />
    </svg>
  );
}

export default function Testimonials() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

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

      // Highlight (green) whichever card is nearest the viewport centre
      const cards = track.children;
      const cx = window.innerWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < cards.length; i++) {
        const r = cards[i].getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - cx);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      for (let i = 0; i < cards.length; i++)
        cards[i].classList.toggle("is-active", i === best);
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
    <section className="testimonials" id="testimonials" ref={sectionRef}>
      <div className="testimonials__pin">
        <h2 className="testimonials__heading">
          I can tell you all this myself <br/> but my clients and colleagues say it better.
        </h2>

        <div className="tst-track" ref={trackRef}>
          {QUOTES.map((q) => (
            <figure className="tst-card" key={q.name}>
              <QuoteMark />
              <blockquote className="tst-card__quote">{q.quote}</blockquote>
              <figcaption className="tst-card__meta">
                <span className="tst-card__name">{q.name}</span>
                <span className="tst-card__company">{q.company}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
