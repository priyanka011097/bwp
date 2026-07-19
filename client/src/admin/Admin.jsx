import { useEffect, useState } from "react";
import "./admin.css";

const API = "/api";

/* ---------------- Login ---------------- */
function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong password");
      return;
    }
    const { token } = await res.json();
    localStorage.setItem("adminToken", token);
    onLogin(token);
  };

  return (
    <div className="adm-login">
      <form className="adm-login__box" onSubmit={submit}>
        <h1>Admin</h1>
        <p>Build With Priyanka.in</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
        />
        {error && <span className="adm-error">{error}</span>}
        <button type="submit">Log in</button>
      </form>
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
    <div className="adm-enq">
      {items.map((e) => (
        <div className="adm-enq__card" key={e.id}>
          <div className="adm-enq__head">
            <strong>{e.name}</strong>
            <span>{new Date(e.createdAt).toLocaleString()}</span>
            <button onClick={() => remove(e.id)}>Delete</button>
          </div>
          <div className="adm-enq__meta">
            {e.email && <span>✉ {e.email}</span>}
            {e.phone && <span>☎ {e.phone}</span>}
            {e.budget && <span>💰 {e.budget}</span>}
          </div>
          <p className="adm-enq__idea">{e.idea}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Generic collection editor ---------------- */
const FIELDS = {
  cases: [
    ["title", "text"],
    ["href", "text"],
    ["video", "text"],
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

/* ---------------- Shell ---------------- */
const TABS = ["enquiries", "cases", "testimonials", "services"];

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [tab, setTab] = useState("enquiries");

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
        {tab === "enquiries" ? (
          <Enquiries token={token} />
        ) : (
          <Collection token={token} type={tab} />
        )}
      </main>
    </div>
  );
}
