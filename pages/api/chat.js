export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message, history, profile_id } = req.body;

  try {
    // ON ENVOIE AU CERVEAU PYTHON (Fly.io)
    // ⚠️ Assure-toi que ce lien est le bon !
    const response = await fetch("https://lianai-v1.fly.dev/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
        history: history,
        profile_id: profile_id || "demo" // Si pas d'ID, on met demo
      }),
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ reply: "Désolé, je ne peux pas répondre pour l'instant (Erreur Serveur)." });
  }
}
