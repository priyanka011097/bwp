import { Link } from "react-router-dom";
import chatImg from "../assets/chat.jpg";
import PillButton from "./PillButton.jsx";

export default function CTA() {
  return (
    <section className="cta" id="cta">
      <div className="cta__card">
        <figure className="cta__media">
          <img src={chatImg} alt="" />
        </figure>

        <div className="cta__content">
          <h2 className="cta__heading">
            Ready to give your idea a place in the world?
          </h2>
          <p className="cta__text">
            Let's sit down together. Tell me what you have in mind, and we'll
            both quickly see if we click.
          </p>

          <PillButton as={Link} to="/chat" variant="oncard">
            Talk to my AI Bot
          </PillButton>
        </div>

        <div className="cta__circles" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
