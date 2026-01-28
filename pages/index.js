import { useEffect, useRef, useState } from "react";
import Head from 'next/head';

// --- CONFIGURATION DES CLIENTS (C'est ici qu'on gère les identités) ---
const CLIENTS = {
  chirincana: {
    title: "Chirincana Ibiza",
    subtitle: "BEACH VIBES & FOOD 🌊",
    welcome: "¡Hola! Welcome to Chirincana Ibiza 🌞\nHow can I help you regarding our menu or reservations? 🍹",
    color: "#000" // Noir
  },
  camping: {
    title: "Camping La Playa",
    subtitle: "NATURE & RELAX 🏕️",
    welcome: "Bonjour ! Bienvenue au Camping La Playa. Cherchez-vous un emplacement Van ou un Bungalow ? 🚐",
    color: "#2E8B57" // Vert Forêt
  },
  demo: {
    title: "Lianai AI",
    subtitle: "ASSISTANT INTELLIGENT 🤖",
    welcome: "Bonjour ! Je suis la démo Lianai. Essayez de me demander ce que je sais faire.",
    color: "#007AFF" // Bleu Tech
  }
};

export default function Home() {
  const [profileId, setProfileId] = useState("demo");
  const [theme, setTheme] = useState(CLIENTS.demo);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const chatRef = useRef(null);

  // 1. AU CHARGEMENT : On détecte qui est le client via l'URL
  useEffect(() => {
    // On regarde l'URL du navigateur
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id"); // ex: ?id=camping

    // Si on connait l'ID, on charge le thème, sinon Demo par défaut
    const currentId = (id && CLIENTS[id]) ? id : "demo";
    
    setProfileId(currentId);
    setTheme(CLIENTS[currentId]);
    
    // Message de bienvenue initial
    setMessages([{ who: "bot", text: CLIENTS[currentId].welcome }]);

  }, []);

  // Scroll automatique vers le bas
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  // FONCTION POUR RENDRE LE TEXTE JOLI (Gras, Liens...)
  const formatMessage = (txt) => {
    if (!txt) return "";
    let formatted = txt
      .replace(/\n/g, '<br/>') // Sauts de ligne
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>') // Gras
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #007AFF; text-decoration: underline; font-weight: bold;">$1</a>'); // Liens
    
    // Listes à puces simples
    formatted = formatted.replace(/- /g, '• ');
    
    return formatted;
  };

  async function sendMessage() {
    const t = text.trim();
    if (!t) return;

    // Affiche message utilisateur
    const newHistory = [...messages, { who: "me", text: t }];
    setMessages(newHistory);
    setText("");
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId, // On envoie l'identité dynamique !
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
        
        <div style={{ width: "100%", maxWidth: "500px", height: "100%", maxHeight: "800px", background: "white", display: "flex", flexDirection: "column", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", borderRadius: "0px", overflow: "hidden", position: "relative" }}>
          
          {/* HEADER DYNAMIQUE */}
          <div style={{ padding: "20px", borderBottom: "1px solid #eee", textAlign: "center", background: "#fff", zIndex: 10 }}>
            <h2 style={{ margin: 0, fontSize: "18px", color: theme.color, textTransform: "uppercase", letterSpacing: "1px" }}>
              {theme.title}
            </h2>
            <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#888", fontWeight: "bold", letterSpacing: "2px" }}>
              {theme.subtitle}
            </p>
          </div>
          
          {/* ZONE DE CHAT */}
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "15px", background: "#fff" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.who === "me" ? "flex-end" : "flex-start" }}>
                <div 
                  style={{ 
                    background: m.who === "me" ? theme.color : "#f2f2f2", 
                    color: m.who === "me" ? "white" : "#333", 
                    padding: "14px 18px", 
                    borderRadius: "18px",
                    borderBottomRightRadius: m.who === "me" ? "4px" : "18px",
                    borderBottomLeftRadius: m.who === "bot" ? "4px" : "18px",
                    maxWidth: "85%",
                    lineHeight: "1.5",
                    fontSize: "15px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                  // C'est ici qu'on active le HTML (Gras, Liens...)
                  dangerouslySetInnerHTML={{ __html: m.who === "me" ? m.text : formatMessage(m.text) }}
                />
              </div>
            ))}
            
            {/* INDICATEUR DE FRAPPE */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#f2f2f2", padding: "10px 15px", borderRadius: "18px", fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                  L'IA écrit...
                </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div style={{ padding: "20px", borderTop: "1px solid #eee", background: "#fff", display: "flex", gap: "10px" }}>
            <input 
              style={{ flex: 1, padding: "15px 20px", borderRadius: "30px", border: "1px solid #eee", outline: "none", fontSize: "16px", background: "#f9f9f9" }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écrivez votre message..."
              disabled={loading}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading}
              style={{ 
                padding: "0 25px", 
                background: theme.color, // Le bouton prend la couleur du client !
                color: "#fff", 
                border: "none", 
                borderRadius: "30px", 
                cursor: "pointer", 
                fontWeight: "bold", 
                fontSize: "14px",
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
