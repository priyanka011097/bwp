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
import Footer from "./components/Footer.jsx";
import Contact from "./components/Contact.jsx";
import FloatingBot from "./components/FloatingBot.jsx";

export default function App() {
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
