import aboutImg from "../assets/aboutus.jpg";
import PillButton from "./PillButton.jsx";

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

        <PillButton href="#contact" variant="light">
          Read my story
        </PillButton>
      </div>

      <figure className="about__media">
        <img src={aboutImg} alt="" />
      </figure>
    </section>
  );
}
