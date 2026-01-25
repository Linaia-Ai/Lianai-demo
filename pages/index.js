import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { who: "bot", text: "Hello! Hola! Bonjour! 🙂 Comment puis-je aider ?" },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);

  const profile_id = "chirincana";

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    setMessages((m) => [...m, { who: "me", text }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id, message: text, session_id: sessionId }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      setMessages((m) => [...m, { who: "bot", text: "Erreur serveur (pas de JSON)." }]);
      return;
    }

    if (data.session_id) setSessionId(data.session_id);

    setMessages((m) => [
      ...m,
      { who: "bot", text: data.reply || "Erreur: pas de réponse." },
    ]);
  }

  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f6f6", minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
        <h2 style={{ margin: "0 0 6px 0" }}>Lianai – Demo</h2>
        <small style={{ color: "#666" }}>Test client (multi-langues). Tape: “hello / hola / bonjour”.</small>

        <div style={{ marginTop: 12, height: "55vh", overflow: "auto", border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.who === "me" ? "flex-end" : "flex-start", margin: "10px 0" }}>
              <div style={{ maxWidth: "80%", padding: "10px 12px", borderRadius: 14, lineHeight: 1.3, background: m.who === "me" ? "#dff1ff" : "#fff" }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Écrire un message…"
            style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <button onClick={send} style={{ padding: "12px 14px", borderRadius: 10, border: 0, background: "#111", color: "#fff" }}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
