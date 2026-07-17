import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Statement from "./components/Statement.jsx";
import Cases from "./components/Cases.jsx";
import Process from "./components/Process.jsx";
import Services from "./components/Services.jsx";
import About from "./components/About.jsx";

export default function App() {
  return (
    <div className="page">
      <Header />
      <Hero />
      <Statement />
      <Cases />
      <Process />
      <Services />
      <About />
    </div>
  );
}
