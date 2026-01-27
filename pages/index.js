import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [session_id, setSessionId] = useState(null);
  const [text, setText] = useState("");
  
  // ICI : Le nouveau message d'accueil Bilingue
  const [messages, setMessages] = useState([
    { who: "bot", text: "¡Hola! Welcome to Chirincana Ibiza 🌞\nHow can I help you regarding our menu or reservations? 🍹" },
  ]);

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function sendMessage() {
    const t = text.trim();
    if (!t) return;

    // 1. On affiche le message de l'utilisateur tout de suite
    const userMsg = { who: "me", text: t };
    // IMPORTANT : On crée la nouvelle liste d'historique complète
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setText("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: "chirincana",
          message: t,
          history: newHistory, // On envoie bien TOUTE la conversation
          session_id: session_id
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      if (data.session_id) setSessionId(data.session_id);
      
      if (data.reply) {
        setMessages((prev) => [...prev, { who: "bot", text: data.reply }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { who: "bot", text: "Connection error... 🌊 Please try again." }]);
    }
  }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', sans-serif", background: "#fafafa", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        
        {/* LE NOUVEAU TITRE */}
        <h2 style={{ textAlign: "center", color: "#222", margin: "0 0 5px 0", textTransform: "uppercase", letterSpacing: "1px" }}>
          Chirincana Ibiza
        </h2>
        <p style={{ textAlign: "center", fontSize: "12px", color: "#ffa500", fontWeight: "bold", marginBottom: "20px", letterSpacing: "2px" }}>
          BEACH VIBES & FOOD 🌊
        </p>
        
        <div ref={chatRef} style={{ height: "500px", overflowY: "auto", border: "1px solid #eee", padding: "20px", marginBottom: "20px", borderRadius: "15px", background: "#fff" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.who === "me" ? "flex-end" : "flex-start", marginBottom: "15px" }}>
              <div style={{ 
                background: m.who === "me" ? "#222" : "#f1f1f1", 
                color: m.who === "me" ? "white" : "#333", 
                padding: "12px 18px", 
                borderRadius: "20px",
                borderBottomRightRadius: m.who === "me" ? "4px" : "20px",
                borderBottomLeftRadius: m.who === "bot" ? "4px" : "20px",
                maxWidth: "80%",
                lineHeight: "1.5",
                fontSize: "15px"
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input 
            style={{ flex: 1, padding: "15px", borderRadius: "30px", border: "1px solid #ddd", outline: "none", fontSize: "16px", paddingLeft: "20px" }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} style={{ padding: "0 25px", background: "#ffa500", color: "#fff", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
