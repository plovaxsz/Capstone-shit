import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key is not configured.' });
  }

  // Keep the browser out of the secret path and validate the chat payload first.
  const { model, max_tokens, system, messages } = req.body || {};

  if (!Array.isArray(messages) || typeof system !== 'string') {
    return res.status(400).json({ error: 'Invalid chat payload.' });
  }

  try {
    const response = await anthropic.messages.create({
      model: model || 'claude-opus-4-6',
      max_tokens: max_tokens || 1024,
      system,
      messages,
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      error: 'Chat request failed.',
      details: error?.message || 'Unknown error',
    });
  }
}