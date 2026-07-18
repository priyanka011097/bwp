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
  const headingRef = useRef(null);
  const stepRefs = useRef([]);
  const imgRefs = useRef([]);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp(-rect.top / total, 0, 1);

      // Circle fills over ~45%, easing out so green rises fast at the start
      const cpRaw = clamp(p / 0.45, 0, 1);
      const cp = 1 - Math.pow(1 - cpRaw, 2); // ease-out
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

      // Each step: the word holds its place; only its image slides in/out beside it
      const n = STEPS.length;
      const pos = tp * n; // 0..n
      STEPS.forEach((step, i) => {
        const el = stepRefs.current[i];
        const img = imgRefs.current[i];
        if (!el) return;
        // fade this step in as its slot approaches, out as it passes
        el.style.opacity = clamp(1 - Math.abs(pos - (i + 0.5)) / 0.6, 0, 1);
        if (img) {
          const local = clamp(pos - i, 0, 1); // progress within this step
          img.style.transform = `translateY(${(0.5 - local) * 360}px)`;
        }
      });
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
    <section className="process" id="process" ref={sectionRef}>
      <div className="process__inner">
        <div className="process__circle" ref={circleRef} aria-hidden="true" />
        {STEPS.map((step, i) => {
          const word = (
            <h2 className="pstep__word" key="w">
              {step.word}
            </h2>
          );
          const image = (
            <figure
              className="pstep__img"
              key="i"
              ref={(el) => (imgRefs.current[i] = el)}
            >
              <img src={step.img} alt="" />
            </figure>
          );
          return (
            <div
              className={`pstep pstep--${step.side}`}
              ref={(el) => (stepRefs.current[i] = el)}
              key={step.word}
            >
              {step.side === "left" ? [word, image] : [image, word]}
            </div>
          );
        })}
      </div>
    </section>
  );
}
