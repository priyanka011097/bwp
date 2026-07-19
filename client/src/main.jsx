import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Admin from "./admin/Admin.jsx";
import Chat from "./chat/Chat.jsx";
import Analytics from "./Analytics.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
