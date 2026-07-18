import leftImg from "../assets/aboutusleft.jpg";
import rightImg from "../assets/aboutusright.png";

export default function Approach() {
  return (
    <section className="approach" id="approach">
      <figure className="approach__img approach__img--left">
        <img src={leftImg} alt="" />
      </figure>

      <div className="approach__text">
        <p className="approach__label">APPROACH</p>
        <h2 className="approach__heading">How I work</h2>
        <p className="approach__body">
          I don't work for you, but with you. I plan the build, share the
          thinking, and take you along in the process. No guesswork, no
          surprises — every decision has a reason.
        </p>

        <a className="approach__cta" href="#contact">
          <span className="approach__cta-text">Discover my approach</span>
          <span className="approach__cta-circle" aria-hidden="true">
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

      <figure className="approach__img approach__img--right">
        <img src={rightImg} alt="" />
      </figure>
    </section>
  );
}
