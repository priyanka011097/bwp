import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Statement from "./components/Statement.jsx";
import Cases from "./components/Cases.jsx";
import Process from "./components/Process.jsx";
import Services from "./components/Services.jsx";
import About from "./components/About.jsx";
import Approach from "./components/Approach.jsx";
import Testimonials from "./components/Testimonials.jsx";
import CTA from "./components/CTA.jsx";
import { useEffect } from "react";
import Footer from "./components/Footer.jsx";
import Contact from "./components/Contact.jsx";
import FloatingBot from "./components/FloatingBot.jsx";

export default function App() {
  // When the page loads with a hash (e.g. arriving at /#contact from the chat
  // page), scroll to that section once it has rendered.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (tries++ < 25) {
        setTimeout(tick, 100);
      }
    };
    setTimeout(tick, 150);
  }, []);

  return (
    <div className="page">
      <Header />
      <Hero />
      <Statement />
      <Cases />
      <Contact />
      <Process />
      <Services />
      <About />
      <Approach />
      <Testimonials />
      <CTA />
      <Footer />
      <FloatingBot />
    </div>
  );
}
