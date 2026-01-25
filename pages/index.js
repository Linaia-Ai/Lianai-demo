import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([
    {
      who: "bot",
      text: "Hello! Hola! Bonjour! 🙂 Comment puis-je aider ?"
    }
  ]);

  const chatRef = useRef(null);

  // 👇 Change ici si tu veux tester un autre client
  const profile_id = "chirincana";

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function add(who, t) {
    setMessages((m) => [...m, { who, text: t }]);
  }

  async function sendMessage() {
    const t = text.trim();
    if (!t) return;
    setText("");
    add("me", t);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id,
          message: t,
          session_id: sessionId
        })
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        add("bot", "Erreur serveur. Regarde les logs Vercel.");
        return;
      }

      if (data.session_id) setSessionId(data.session_id);
      add("bot", data.reply || "Pas de réponse.");
    } catch (e) {
      add("bot", "Erreur réseau (impossible de joindre le backend).");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ margin: 0 }}>Lianai – Demo</h2>
        <small style={{ color: "#666" }}>
          Test client (multi-langues). Tape: “hello / hola / bonjour”.
        </small>

        <div ref={chatRef} style={styles.chat}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.who === "me" ? "flex-end" : "flex-start",
                margin: "10px 0"
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  background: m.who === "me" ? "#dff1ff" : "#fff"
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.bar}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Écrire un message…"
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.button}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "system-ui, -apple-system, Arial",
    background: "#f6f6f6",
    minHeight: "100vh",
    padding: 16
  },
  card: {
    maxWidth: 720,
    margin: "0 auto",
    background: "white",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,.06)"
  },
  chat: {
    height: "55vh",
    overflow: "auto",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 12,
    background: "#fafafa",
    marginTop: 12
  },
  bubble: {
    maxWidth: "80%",
    padding: "10px 12px",
    borderRadius: 14,
    lineHeight: 1.3,
    border: "1px solid #eee"
  },
  bar: {
    display: "flex",
    gap: 8,
    marginTop: 12
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd"
  },
  button: {
    padding: "12px 14px",
    borderRadius: 10,
    border: 0,
    background: "#111",
    color: "#fff",
    cursor: "pointer"
  }
};
