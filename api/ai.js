/**
 * Serverless API endpoint (/api/ai) so all JomINVEST users share the
 * application's configured AI key (process.env.AI_API_KEY or process.env.VITE_AI_API_KEY)
 * without requiring user-supplied keys or exposing credentials in client bundles.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.AI_API_KEY || process.env.VITE_AI_API_KEY || '';
  if (!apiKey) {
    return res.status(503).json({ error: 'Server AI_API_KEY not configured' });
  }

  try {
    const { systemPrompt, userPrompt } = req.body || {};
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: systemPrompt ? { parts: [{ text: String(systemPrompt) }] } : undefined,
          contents: [{ role: 'user', parts: [{ text: String(userPrompt || '') }] }],
          generationConfig: { temperature: 0.25, maxOutputTokens: 900 }
        })
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream request failed' });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ text });
  } catch {
    return res.status(500).json({ error: 'Internal proxy error' });
  }
}
