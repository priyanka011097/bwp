import { useEffect, useRef } from "react";
import heroImg1 from "../assets/heroimg1.jpg";
import heroImg2 from "../assets/heroimg2.jpg";

export default function Hero() {
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const personRef = useRef(null);
  const shelfRef = useRef(null);

  useEffect(() => {
    const SPEED = 0.6; // px moved per px scrolled
    let raf = 0;

    const update = () => {
      raf = 0;
      const offset = window.scrollY * SPEED;
      if (line1Ref.current)
        line1Ref.current.style.transform = `translateX(${offset}px)`;
      if (line2Ref.current)
        line2Ref.current.style.transform = `translateX(${-offset}px)`;
      if (personRef.current)
        personRef.current.style.transform = `translateY(${-window.scrollY * 0.45}px)`;
      if (shelfRef.current)
        shelfRef.current.style.transform = `translateY(${window.scrollY * 0.45}px)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero">
      {/* Giant wordmark */}
      <h1 className="hero__title">
        <span ref={line1Ref}>Build With</span>
        <span ref={line2Ref}>Priyanka.in</span>
      </h1>

      {/* Photos (swap the images in /public/images) */}
      <figure className="hero__photo hero__photo--person" ref={personRef}>
        <img src={heroImg2} alt="" />
      </figure>
      <figure className="hero__photo hero__photo--shelf" ref={shelfRef}>
        <img src={heroImg1} alt="" />
      </figure>

      {/* Rotating scroll badge */}
      <a className="hero__badge" href="#services" aria-label="How we roll — scroll down">
        <svg className="hero__badge-ring" viewBox="0 0 140 140" aria-hidden="true">
          <defs>
            <path
              id="badge-circle"
              d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0"
            />
          </defs>
          <text>
            <textPath href="#badge-circle" startOffset="0">
              HOW WE ROLL • HOW WE ROLL •&nbsp;
            </textPath>
          </text>
        </svg>
        <span className="hero__badge-dot" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M12 4v14m0 0l-6-6m6 6l6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>

      {/* Tagline */}
      <p className="hero__tagline">
        Software developer for
        <br />
        entrepreneurs with a vision
      </p>
    </section>
  );
}
