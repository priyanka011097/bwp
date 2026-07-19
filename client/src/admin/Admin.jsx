import { useEffect, useState } from "react";
import "./admin.css";

const API = "/api";

/* ---------------- Login ---------------- */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Login({ onLogin }) {
  const [error, setError] = useState("");

  const finish = (token) => {
    localStorage.setItem("adminToken", token);
    onLogin(token);
  };

  // Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    async function handleCredential(response) {
      setError("");
      let res;
      try {
        res = await fetch(`${API}/admin/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
      } catch {
        setError("Can't reach the backend server (is it running?)");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Sign-in failed (${res.status})`);
        return;
      }
      const { token } = await res.json();
      finish(token);
    }

    function init() {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("gbtn"),
        { theme: "outline", size: "large", width: 300 }
      );
    }

    if (window.google?.accounts?.id) {
      init();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = init;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="adm-login">
      <div className="adm-login__box">
        <h1>Admin</h1>
        <p>Sign in to Build With Priyanka.in</p>

        {GOOGLE_CLIENT_ID ? (
          <div id="gbtn" className="adm-gbtn" />
        ) : (
          <span className="adm-error">
            Google sign-in isn't configured. Set VITE_GOOGLE_CLIENT_ID.
          </span>
        )}
        {error && <span className="adm-error">{error}</span>}
      </div>
    </div>
  );
}

/* ---------------- Enquiries ---------------- */
function Enquiries({ token }) {
  const [items, setItems] = useState([]);

  const load = () =>
    fetch(`${API}/admin/enquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setItems);

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this enquiry?")) return;
    await fetch(`${API}/admin/enquiries/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  if (!items.length) return <p className="adm-empty">No enquiries yet.</p>;

  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Budget</th>
            <th>Idea</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id}>
              <td className="adm-td-date">
                {new Date(e.createdAt).toLocaleDateString()}
                <br />
                {new Date(e.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td>{e.name}</td>
              <td>
                {e.email ? <a href={`mailto:${e.email}`}>{e.email}</a> : "—"}
              </td>
              <td>{e.phone || "—"}</td>
              <td>{e.budget || "—"}</td>
              <td className="adm-td-idea">{e.idea}</td>
              <td>
                <button className="adm-td-del" onClick={() => remove(e.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Generic collection editor ---------------- */
const FIELDS = {
  cases: [
    ["title", "text"],
    ["href", "text"],
    ["video", "media"],
    ["tags", "tags"],
  ],
  testimonials: [
    ["name", "text"],
    ["company", "text"],
    ["quote", "textarea"],
  ],
  services: [
    ["title", "text"],
    ["desc", "textarea"],
    ["tags", "tags"],
  ],
};

function Collection({ token, type }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`${API}/admin/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setItems);
  }, [type]);

  const update = (i, key, value) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    setItems(next);
  };

  const addItem = () =>
    setItems([...items, { id: `${type[0]}${Date.now()}` }]);

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const uploadFile = async (i, key, file) => {
    const fd = new FormData();
    fd.append("file", file);
    setStatus("Uploading…");
    const res = await fetch(`${API}/admin/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (res.ok) {
      const { url } = await res.json();
      update(i, key, url);
      setStatus("Uploaded ✓");
    } else {
      setStatus("Upload failed");
    }
    setTimeout(() => setStatus(""), 2000);
  };

  const save = async () => {
    setStatus("Saving…");
    const res = await fetch(`${API}/admin/${type}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(items),
    });
    setStatus(res.ok ? "Saved ✓" : "Error saving");
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="adm-coll">
      <div className="adm-coll__actions adm-coll__actions--top">
        <button className="adm-add" onClick={addItem}>
          + Add {type.slice(0, -1)}
        </button>
        <button className="adm-save" onClick={save}>
          Save changes
        </button>
        <span className="adm-status">{status}</span>
      </div>

      {items.map((item, i) => (
        <div className="adm-item" key={item.id || i}>
          {FIELDS[type].map(([key, kind]) => (
            <label className="adm-field" key={key}>
              <span>{key}</span>
              {kind === "textarea" ? (
                <textarea
                  rows="3"
                  value={item[key] || ""}
                  onChange={(e) => update(i, key, e.target.value)}
                />
              ) : kind === "tags" ? (
                <input
                  value={(item[key] || []).join(", ")}
                  onChange={(e) =>
                    update(
                      i,
                      key,
                      e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    )
                  }
                  placeholder="comma, separated, tags"
                />
              ) : kind === "media" ? (
                <>
                  <input
                    value={item[key] || ""}
                    onChange={(e) => update(i, key, e.target.value)}
                    placeholder="Paste a URL, or upload a file below"
                  />
                  <input
                    type="file"
                    accept="video/*,image/*"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) uploadFile(i, key, f);
                    }}
                  />
                  {item[key] && (
                    <span className="adm-media-preview">
                      Current: {item[key]}
                    </span>
                  )}
                </>
              ) : (
                <input
                  value={item[key] || ""}
                  onChange={(e) => update(i, key, e.target.value)}
                />
              )}
            </label>
          ))}
          <button className="adm-remove" onClick={() => removeItem(i)}>
            Remove
          </button>
        </div>
      ))}

      <div className="adm-coll__actions">
        <button className="adm-add" onClick={addItem}>
          + Add {type.slice(0, -1)}
        </button>
        <button className="adm-save" onClick={save}>
          Save changes
        </button>
        <span className="adm-status">{status}</span>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ token, onGo }) {
  const [stats, setStats] = useState({
    enquiries: 0,
    cases: 0,
    testimonials: 0,
    services: 0,
  });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch(`${API}/admin/enquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((list) => {
        setStats((s) => ({ ...s, enquiries: list.length }));
        setRecent(list.slice(0, 5));
      })
      .catch(() => {});
    fetch(`${API}/content`)
      .then((r) => r.json())
      .then((c) =>
        setStats((s) => ({
          ...s,
          cases: c.cases?.length || 0,
          testimonials: c.testimonials?.length || 0,
          services: c.services?.length || 0,
        }))
      )
      .catch(() => {});
  }, []);

  const CARDS = [
    ["Enquiries", stats.enquiries, "enquiries"],
    ["Cases", stats.cases, "cases"],
    ["Testimonials", stats.testimonials, "testimonials"],
    ["Services", stats.services, "services"],
  ];

  return (
    <div className="adm-dash">
      <div className="adm-stats">
        {CARDS.map(([label, value, tab]) => (
          <button className="adm-stat" key={label} onClick={() => onGo(tab)}>
            <span className="adm-stat__value">{value}</span>
            <span className="adm-stat__label">{label}</span>
          </button>
        ))}
      </div>

      <h2 className="adm-dash__h">Recent enquiries</h2>
      {recent.length ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Budget</th>
                <th>Idea</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id}>
                  <td className="adm-td-date">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </td>
                  <td>{e.name}</td>
                  <td>{e.email || "—"}</td>
                  <td>{e.budget || "—"}</td>
                  <td className="adm-td-idea">{e.idea}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="adm-empty">No enquiries yet.</p>
      )}
    </div>
  );
}

/* ---------------- Shell ---------------- */
const TABS = ["dashboard", "enquiries", "cases", "testimonials", "services"];

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [tab, setTab] = useState("dashboard");

  if (!token) return <Login onLogin={setToken} />;

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  return (
    <div className="adm">
      <header className="adm-top">
        <h1>Admin</h1>
        <nav className="adm-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={t === tab ? "is-active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <button className="adm-logout" onClick={logout}>
          Log out
        </button>
      </header>

      <main className="adm-body">
        {tab === "dashboard" ? (
          <Dashboard token={token} onGo={setTab} />
        ) : tab === "enquiries" ? (
          <Enquiries token={token} />
        ) : (
          <Collection token={token} type={tab} />
        )}
      </main>
    </div>
  );
}
