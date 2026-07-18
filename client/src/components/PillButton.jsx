function ArrowDiagonal() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 17L17 7M17 7H8M17 7V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 12h15M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PillButton({ children, as = "a", variant, ...rest }) {
  const Tag = as;
  return (
    <Tag
      className={`pill-btn${variant ? ` pill-btn--${variant}` : ""}`}
      {...rest}
    >
      <span className="pill-btn__circle pill-btn__circle--left" aria-hidden="true">
        <ArrowDiagonal />
      </span>
      <span className="pill-btn__pill">{children}</span>
      <span className="pill-btn__circle pill-btn__circle--right" aria-hidden="true">
        <ArrowRight />
      </span>
    </Tag>
  );
}
