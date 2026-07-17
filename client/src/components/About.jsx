import aboutImg from "../assets/aboutus.jpg";

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about__text">
        <p className="about__label">ABOUT</p>
        <h2 className="about__heading">Who I am</h2>
        <p className="about__body">
          I'm Priyanka, a software developer who has shipped products for
          startups and growing teams. I now build from my own studio for
          founders who understand that good software is more than code: every
          decision counts.
        </p>

        <a className="about__cta" href="#contact">
          <span className="about__cta-text">Read my story</span>
          <span className="about__cta-circle" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
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

      <figure className="about__media">
        <img src={aboutImg} alt="" />
      </figure>
    </section>
  );
}
