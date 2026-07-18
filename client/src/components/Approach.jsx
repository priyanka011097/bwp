import leftImg from "../assets/aboutusleft.jpg";
import rightImg from "../assets/aboutusright.png";
import PillButton from "./PillButton.jsx";

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

        <PillButton href="#contact">Discover my approach</PillButton>
      </div>

      <figure className="approach__img approach__img--right">
        <img src={rightImg} alt="" />
      </figure>
    </section>
  );
}
