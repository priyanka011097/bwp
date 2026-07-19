import { Link } from "react-router-dom";
import aiBot from "../assets/ai-bot.mp4";

// Floating AI-bot launcher pinned to the bottom-right of the site.
// Clicking it opens the chat page.
export default function FloatingBot() {
  return (
    <Link
      to="/chat"
      className="floating-bot"
      aria-label="Chat with Priyanka's AI bot"
    >
      <span className="floating-bot__label">Chat with me</span>
      <span className="floating-bot__video">
        <video src={aiBot} autoPlay loop muted playsInline />
      </span>
    </Link>
  );
}
