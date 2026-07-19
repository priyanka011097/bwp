import { useEffect, useState } from "react";

// Fetches a content collection from the backend once, falling back to the
// built-in defaults (so the site still works with no backend / static deploy).
export function useContent(key, fallback) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    let alive = true;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && Array.isArray(d[key]) && d[key].length) setData(d[key]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key]);

  return data;
}
