import logo from "../assets/logodark.png";

const NAV = [
  ["Home", "#"],
  ["My work", "#work"],
  ["Contact", "#contact"],
  ["Services", "#services"],
  ["About me", "#about"],
  ["How I work", "#approach"],
  ["Talk to AI bot", "#cta"],
];

function Social({ label, href, children }) {
  return (
    <a
      className="footer__social-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer__inner">
        <div className="footer__col footer__brand">
          <img
            className="footer__logo"
            src={logo}
            alt="Build With Priyanka.in"
          />
          <p className="footer__tagline">
            Software developer for entrepreneurs with a vision.
          </p>
        </div>

        <nav className="footer__col footer__nav">
          {NAV.map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="footer__col footer__contact">
          <a href="tel:+918983569162">+91 89835 69162</a>
          <span>Navi Mumbai</span>

          <div className="footer__social">
            <Social
              label="Instagram"
              href="https://www.instagram.com/build_with_priyanka/"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.4" fill="currentColor" />
              </svg>
            </Social>
            <Social
              label="LinkedIn"
              href="https://www.linkedin.com/in/priyanka-shahasane/"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
                <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z" />
              </svg>
            </Social>
            <Social label="WhatsApp" href="https://wa.me/918983569162">
              <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.86 9.86 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.73c0 4.46-3.63 8.09-8.1 8.09-1.47 0-2.9-.4-4.16-1.14l-.3-.18-3.14.82.84-3.06-.2-.31a8.02 8.02 0 0 1-1.25-4.28c0-4.46 3.63-8.09 8.1-8.09zm-4.5 4.3c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.62 0 1.55 1.13 3.04 1.28 3.25.16.21 2.19 3.34 5.3 4.55 2.6 1.02 3.13.82 3.69.77.56-.05 1.82-.74 2.07-1.46.26-.72.26-1.33.18-1.46-.08-.13-.29-.21-.6-.37-.31-.16-1.82-.9-2.1-1-.29-.11-.5-.16-.7.16-.21.31-.8 1-.98 1.2-.18.21-.36.24-.67.08-.31-.16-1.3-.48-2.48-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.55.16-.18.21-.31.31-.52.11-.21.05-.39-.03-.55-.08-.16-.7-1.69-.96-2.31-.25-.6-.5-.52-.7-.53-.18 0-.39-.01-.6-.01z" />
              </svg>
            </Social>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__legal">
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
            Privacy &amp; Cookies
          </a>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer">
            Terms &amp; Conditions
          </a>
        </div>
        <span>© 2026 Build With Priyanka.in</span>
      </div>
    </footer>
  );
}
