import { useState, useEffect } from "react";
import Logo from "./Logo.jsx";

const NAV_ITEMS = ["Home", "Services", "About Me", "Contact Me"];
const CLOSE_MS = 600;

export default function Header({ showLogo = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Logo only shows at the very top of the page
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => {
    setClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
    }, CLOSE_MS);
  };

  // Close on Escape and lock body scroll while the menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && closeMenu();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`header${showLogo ? "" : " header--no-logo"}${
          scrolled ? " header--scrolled" : ""
        }`}
      >
        {showLogo && <Logo />}
        <button
          className="menu-btn"
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
      </header>

      {menuOpen && (
        <div
          className={`menu-overlay${closing ? " menu-overlay--closing" : ""}`}
          role="dialog"
          aria-modal="true"
        >
          <span className="menu-circle menu-circle--green" aria-hidden="true" />
          <span className="menu-circle menu-circle--blue" aria-hidden="true" />

          <div className="menu-content">
            <div className="menu-overlay__top">
              <Logo />
              <button
                className="menu-btn menu-btn--close"
                type="button"
                onClick={closeMenu}
              >
                Close
              </button>
            </div>

            <nav className="menu-nav">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item}
                  className="menu-nav__link"
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={closeMenu}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
