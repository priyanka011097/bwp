import { useEffect, useRef } from "react";
import PillButton from "./PillButton.jsx";

const TEXT =
  "I build software that adds an extra layer to everyday life. Strategy, design, web, apps, cloud: five services, one vision. What we make together will one day find its place in the world. Let's make it better.";

export default function Statement() {
  const textRef = useRef(null);

  useEffect(() => {
    const words = textRef.current.querySelectorAll(".statement__word");
    let raf = 0;

    const update = () => {
      raf = 0;
      // Words become "active" (dark) once they cross this line on the way up
      const threshold = window.innerHeight * 0.62;
      words.forEach((w) => {
        const { top } = w.getBoundingClientRect();
        w.classList.toggle("is-active", top < threshold);
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
    <section className="statement" id="statement">
      <div className="statement__inner">
        <p className="statement__text" ref={textRef}>
          {TEXT.split(" ").map((word, i) => (
            <span className="statement__word" key={i}>
              {word}{" "}
            </span>
          ))}
        </p>

        <PillButton href="#contact">Start your project</PillButton>
      </div>
    </section>
  );
}
