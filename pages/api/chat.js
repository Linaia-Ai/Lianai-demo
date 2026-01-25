export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const backend = process.env.BACKEND_URL; // ex: https://lianai-v1.fly.dev
  if (!backend) return res.status(500).json({ error: "BACKEND_URL missing" });

  try {
    const r = await fetch(`${backend}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await r.text();
    // parfois le backend renvoie HTML si erreur → on protège
    try {
      const json = JSON.parse(text);
      return res.status(r.status).json(json);
    } catch {
      return res.status(500).json({ error: "Backend returned non-JSON", raw: text.slice(0, 300) });
    }
  } catch (e) {
    return res.status(500).json({ error: "Proxy error", details: String(e) });
  }
}
