import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = import.meta.env.VITE_GA_ID;

// Loads Google Analytics (GA4) if VITE_GA_ID is set, and sends a page_view
// on every route change (this is a single-page app).
export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false });
  }, []);

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
}
