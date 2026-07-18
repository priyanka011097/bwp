import { useState } from "react";

const EMPTY = { name: "", email: "", phone: "", idea: "", budget: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const lines = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Number: ${form.phone}`,
      `Idea: ${form.idea}`,
      `Budget: ${form.budget}`,
    ].join("\n");
    const subject = `New project enquiry — ${form.name || "someone"}`;
    window.location.href = `mailto:hello@buildwithpriyanka.in?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(lines)}`;
  };

  return (
    <section className="contact" id="contact">
      <div className="contact__inner">
        <p className="contact__label">CONTACT</p>
        <h2 className="contact__heading">Start your project</h2>

        <form className="contact__form" onSubmit={submit}>
          <div className="contact__row">
            <label className="field">
              <span>Name</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handle}
                placeholder="Your name"
                required
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="you@email.com"
                required
              />
            </label>
            <label className="field">
              <span>Number</span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handle}
                placeholder="+91 00000 00000"
              />
            </label>
          </div>

          <label className="field">
            <span>What's your idea?</span>
            <textarea
              name="idea"
              rows="4"
              value={form.idea}
              onChange={handle}
              placeholder="Tell me what you want to build…"
              required
            />
          </label>

          <label className="field">
            <span>What's your budget?</span>
            <input
              name="budget"
              type="text"
              value={form.budget}
              onChange={handle}
              placeholder="I don't generate a quote — I ask your budget and fit everything in that."
              required
            />
          </label>

          <button className="contact__submit" type="submit">
            Send it over
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M4 12h15M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
