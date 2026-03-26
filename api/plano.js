export default async function handler(req, res) {
  // CORS — deve ser definido ANTES de qualquer return
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS — responde imediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API Key do servidor (nunca exposta no frontend)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key não configurada no servidor.' });
  }

  try {
    const { system, messages, max_tokens } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 6000,
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Erro na API Anthropic' });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
}
