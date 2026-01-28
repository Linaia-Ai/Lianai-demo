import { useEffect, useRef, useState } from "react";
import Head from 'next/head';

// --- CONFIGURATION DES CLIENTS ---
const CLIENTS = {
  chirincana: {
    title: "Chirincana Ibiza",
    subtitle: "BEACH VIBES & FOOD 🌊",
    welcome: "¡Hola! Welcome to Chirincana Ibiza 🌞\nHow can I help you regarding our menu or reservations? 🍹",
    color: "#000000",
    highlight: "#ffa500" // Orange
  },
  camping: {
    title: "Camping La Playa",
    subtitle: "NATURE & RELAX 🏕️",
    welcome: "Bonjour ! Bienvenue au Camping La Playa. 🌲\nCherchez-vous un emplacement pour Van, une Tente ou un Bungalow ?",
    color: "#2E8B57",
    highlight: "#2E8B57" // Vert
  },
  demo: {
    title: "Lianai AI",
    subtitle: "ASSISTANT INTELLIGENT 🤖",
    welcome: "Bonjour ! Je suis Lianai. 🤖\nJe suis une IA capable de gérer les réservations de Restaurant ou de conseiller des Vacanciers.\n\nEssayez de me demander : 'Comment ça marche ?'",
    color: "#007AFF", // Bleu Tech
    highlight: "#007AFF"
  }
};

export default function Home() {
  // PAR DÉFAUT : On met "demo" (Lianai) et pas "camping"
  const [profileId, setProfileId] = useState("demo"); 
  const [theme, setTheme] = useState(CLIENTS.demo);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const chatRef = useRef(null);

  // 1. DÉTECTION CLIENT VIA URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id"); 

    // Si ID trouvé dans l'URL et qu'il existe dans notre liste -> On charge le Client
    if (id && CLIENTS[id]) {
      setProfileId(id);
      setTheme(CLIENTS[id]);
      setMessages([{ who: "bot", text: CLIENTS[id].welcome }]);
    } else {
      // Sinon (URL vide) -> On charge la DÉMO LIANAI
      setProfileId("demo");
      setTheme(CLIENTS.demo);
      setMessages([{ who: "bot", text: CLIENTS.demo.welcome }]);
    }
  }, []);

  // Scroll automatique
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  // --- LE MOTEUR DE DESIGN ---
  const formatMessage = (txt, highlightColor) => {
    if (!txt) return "";
    let formatted = txt
      .replace(/\n/g, '<br/>') 
      .replace(/\*\*([^*]+)\*\*/g, `<b style="color: ${highlightColor}; font-weight: 800;">$1</b>`) 
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #007AFF; text-decoration: underline; font-weight: bold;">$1</a>')
      .replace(/^- /gm, '• ');
    
    return formatted;
  };

  async function sendMessage() {
    const t = text.trim();
    if (!t) return;

    const newHistory = [...messages, { who: "me", text: t }];
    setMessages(newHistory);
    setText("");
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId, // Envoie "demo", "camping" ou "chirincana"
          message: t,
          history: newHistory
        }),
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      
      if (data.reply) {
        setMessages((prev) => [...prev, { who: "bot", text: data.reply }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { who: "bot", text: "Oups, petite erreur de connexion... 🌊 Réessayez." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{theme.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", background: "#f4f4f9", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        
        <div style={{ width: "100%", maxWidth: "500px", height: "100%", maxHeight: "800px", background: "white", display: "flex", flexDirection: "column", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", overflow: "hidden", position: "relative" }}>
          
          {/* HEADER */}
          <div style={{ padding: "20px", borderBottom: "1px solid #eee", textAlign: "center", background: "#fff", zIndex: 10 }}>
            <h2 style={{ margin: 0, fontSize: "18px", color: theme.color, textTransform: "uppercase", letterSpacing: "1px" }}>
              {theme.title}
            </h2>
            <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#888", fontWeight: "bold", letterSpacing: "2px" }}>
              {theme.subtitle}
            </p>
          </div>
          
          {/* CHAT */}
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "15px", background: "#fff" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.who === "me" ? "flex-end" : "flex-start" }}>
                <div 
                  style={{ 
                    background: m.who === "me" ? theme.color : "#f8f9fa", 
                    color: m.who === "me" ? "white" : "#333", 
                    padding: "14px 18px", 
                    borderRadius: "18px",
                    borderBottomRightRadius: m.who === "me" ? "4px" : "18px",
                    borderBottomLeftRadius: m.who === "bot" ? "4px" : "18px",
                    maxWidth: "85%",
                    lineHeight: "1.6",
                    fontSize: "15px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                  dangerouslySetInnerHTML={{ __html: m.who === "me" ? m.text : formatMessage(m.text, theme.highlight) }}
                />
              </div>
            ))}
            
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#f8f9fa", padding: "10px 15px", borderRadius: "18px", fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                  L'IA écrit...
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <div style={{ padding: "20px", borderTop: "1px solid #eee", background: "#fff", display: "flex", gap: "10px" }}>
            <input 
              style={{ flex: 1, padding: "15px 20px", borderRadius: "30px", border: "1px solid #eee", outline: "none", fontSize: "16px", background: "#f9f9f9" }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Message..."
              disabled={loading}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading}
              style={{ 
                width: "50px",
                height: "50px",
                background: theme.color, 
                color: "#fff", 
                border: "none", 
                borderRadius: "50%", 
                cursor: "pointer", 
                fontWeight: "bold", 
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: loading ? 0.5 : 1
              }}>
              ➤
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
