export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  // On force l'URL SANS le /chat à la fin pour voir si ton app Fly.io accepte la route racine d'abord
  const FLY_URL = "https://lianai-v1.fly.dev/chat";

  console.log("Appel du backend Fly.io à l'adresse:", FLY_URL);

  try {
    const response = await fetch(FLY_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const status = response.status;
      console.error(`Fly.io a répondu avec une erreur: ${status}`);
      return res.status(status).json({ error: `Fly.io error ${status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erreur fatale Bridge Vercel:", error.message);
    return res.status(502).json({ error: "Impossible de joindre Fly.io", details: error.message });
  }
}
