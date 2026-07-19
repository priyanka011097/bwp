import { useState } from "react";
import PillButton from "./PillButton.jsx";

const EMPTY = { name: "", email: "", phone: "", idea: "", budget: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm(EMPTY);
        return;
      }
    } catch {
      // fall through to email fallback
    }
    // Fallback (e.g. static deploy with no backend): open email app
    const lines = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Number: ${form.phone}`,
      `Idea: ${form.idea}`,
      `Budget: ${form.budget}`,
    ].join("\n");
    window.location.href = `mailto:hello@buildwithpriyanka.in?subject=${encodeURIComponent(
      `New project enquiry — ${form.name || "someone"}`
    )}&body=${encodeURIComponent(lines)}`;
  };

  return (
    <section className="contact" id="contact">
      <div className="contact__inner">
        <p className="contact__label">CONTACT</p>
        <h2 className="contact__heading">Start your project</h2>

        {sent && (
          <p className="contact__sent">
            Thanks — your message is in. I'll get back to you soon.
          </p>
        )}

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
            <textarea
              name="budget"
              rows="2"
              value={form.budget}
              onChange={handle}
              placeholder="I don't generate a quote — I ask your budget and fit everything in that."
              required
            />
          </label>

          <PillButton as="button" type="submit">
            Send it over
          </PillButton>
        </form>
      </div>
    </section>
  );
}
