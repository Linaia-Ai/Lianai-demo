export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { profile_id, message, session_id } = req.body || {};
  if (!profile_id || !message) return res.status(400).json({ error: "Missing profile_id or message" });

  const backend = process.env.BACKEND_URL || "https://lianai-v1.fly.dev";

  try {
    const r = await fetch(`${backend}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id, message, session_id }),
    });

    const text = await r.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) {}

    if (!r.ok) {
      return res.status(500).json({ error: "Backend error", status: r.status, body: text });
    }
    return res.status(200).json(data || { reply: "Erreur: réponse backend non JSON." });
  } catch (e) {
    return res.status(500).json({ error: "Proxy failed", details: String(e) });
  }
}
