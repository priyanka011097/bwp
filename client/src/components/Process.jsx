import { useEffect, useRef } from "react";
import layoutImg from "../assets/layout.jpg";
import buildingImg from "../assets/building.png";
import finalImg from "../assets/final_product.jpg";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const STEPS = [
  { word: "From Layout", img: layoutImg, side: "left" }, // word left of image
  { word: "Then Build", img: buildingImg, side: "right" }, // word right of image
  { word: "Final Product", img: finalImg, side: "left" }, // word left of image
];

export default function Process() {
  const sectionRef = useRef(null);
  const circleRef = useRef(null);
  const trackRef = useRef(null);
  const headingRef = useRef(null);
  const wordRefs = useRef([]);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp(-rect.top / total, 0, 1);

      // Circle starts opening right away (no empty lead-in), fills over ~45%
      const cp = clamp(p / 0.45, 0, 1);
      const tp = clamp((p - 0.45) / 0.55, 0, 1);
      if (circleRef.current) {
        const diameter = 2 * Math.hypot(window.innerWidth / 2, window.innerHeight) * 1.04;
        circleRef.current.style.width = `${diameter}px`;
        circleRef.current.style.height = `${diameter}px`;
        circleRef.current.style.transform = `translate(-50%, -50%) scale(${cp})`;
      }

      // "How I Work" fades in inside the green, then out as the steps scroll in
      if (headingRef.current)
        headingRef.current.style.opacity =
          clamp((cp - 0.5) / 0.5, 0, 1) * clamp(1 - tp / 0.12, 0, 1);

      // Steps fade in as the green fills, then the stack scrolls to center each row
      if (trackRef.current) {
        const track = trackRef.current;
        const vh = window.innerHeight;
        const rowH = track.firstElementChild
          ? track.firstElementChild.offsetHeight
          : 300;
        const trackH = track.scrollHeight;
        // Slide the whole stack from the bottom up to the top — one row at a time
        const startY = vh - rowH; // first row sits near the bottom
        const range = vh + trackH - 2 * rowH; // travel: bottom → top
        const y = startY - tp * range;
        track.style.transform = `translateY(${y}px)`;
        track.style.opacity = clamp((cp - 0.55) / 0.45, 0, 1);
      }
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
    <section className="process" id="approach" ref={sectionRef}>
      <div className="process__inner">
        <div className="process__circle" ref={circleRef} aria-hidden="true" />
        <div className="pstep-track" ref={trackRef}>
          {STEPS.map((step, i) => {
            const word = (
              <h2
                className="pstep__word"
                ref={(el) => (wordRefs.current[i] = el)}
                key="w"
              >
                {step.word}
              </h2>
            );
            const image = (
              <figure className="pstep__img" key="i">
                <img src={step.img} alt="" />
              </figure>
            );
            return (
              <div className={`pstep pstep--${step.side}`} key={step.word}>
                {step.side === "left" ? [word, image] : [image, word]}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
