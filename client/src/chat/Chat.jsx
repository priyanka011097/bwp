import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./chat.css";

const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm Priyanka's AI assistant 👋 Ask me anything about her work, services, or how she can help build your idea.",
};

const SUGGESTIONS = [
  "What does Priyanka build?",
  "Can you help with an AI chatbot?",
  "What projects has she worked on?",
  "How do I start a project?",
];

const WHATSAPP = "https://wa.me/918983569162";

// A stable per-visitor id so the admin can see each conversation grouped together.
function getSessionId() {
  try {
    let id = localStorage.getItem("chatSessionId");
    if (!id) {
      id =
        (crypto.randomUUID && crypto.randomUUID()) ||
        `s${Date.now()}${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("chatSessionId", id);
    }
    return id;
  } catch {
    return `s${Date.now()}`;
  }
}

// Turn plain URLs inside a message into clickable links.
function renderContent(text) {
  return String(text)
    .split(/(https?:\/\/[^\s]+)/g)
    .map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noreferrer">
          {part.includes("wa.me") ? "WhatsApp Priyanka" : part}
        </a>
      ) : (
        part
      )
    );
}

export default function Chat() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
    fetch("/api/content")
      .then((r) => r.json())
      .then((c) => setResume(c?.settings?.resume || ""))
      .catch(() => {});
  }, []);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          messages: next.filter((m) => m.role !== "system"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        data.reply ||
        "Sorry — I couldn't reach the assistant just now. Please try again, or use the contact form and Priyanka will get back to you.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry — I couldn't reach the assistant just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <div className="chat">
      <header className="chat__top">
        <Link to="/" className="chat__back" aria-label="Back to home">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back</span>
        </Link>
        <div className="chat__title">
          <span className="chat__avatar" aria-hidden="true">P</span>
          <div>
            <strong>Priyanka's AI Bot</strong>
            <span className="chat__status">Usually replies instantly</span>
          </div>
        </div>
      </header>

      <div className="chat__scroll" ref={scrollRef}>
        <div className="chat__list">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat__msg chat__msg--${
                m.role === "user" ? "user" : "bot"
              }`}
            >
              {m.role === "user" ? m.content : renderContent(m.content)}
            </div>
          ))}

          {loading && (
            <div className="chat__msg chat__msg--bot chat__typing">
              <span />
              <span />
              <span />
            </div>
          )}

          {showSuggestions && (
            <div className="chat__suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="chat__actions">
        <a className="chat__action" href="/#contact">
          📝 Fill contact form
        </a>
        {resume && (
          <a
            className="chat__action"
            href={resume}
            target="_blank"
            rel="noreferrer"
            download
          >
            ⬇ Download resume
          </a>
        )}
        <a
          className="chat__action chat__action--wa"
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-1-.3-1.6-.6-2.9-1.3-4.7-4.2-4.9-4.4-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.7-.9c.2-.3.4-.2.7-.1l1.8.9c.3.1.5.2.5.4.1.2.1.9-.1 1.5Z"
            />
          </svg>
          WhatsApp
        </a>
      </div>

      <div className="chat__composer">
        <textarea
          ref={inputRef}
          rows="1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message…"
        />
        <button
          className="chat__send"
          onClick={() => send()}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M4 12l16-8-6 8 6 8-16-8z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
