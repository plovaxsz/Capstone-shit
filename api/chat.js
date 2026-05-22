import Anthropic from '@anthropic-ai/sdk';

const lastRequestTimes = new Map();

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

  // Simple per-client cooldown so the proxy cannot be spammed in quick bursts.
  const clientKey = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const lastRequestTime = lastRequestTimes.get(clientKey) || 0;
  const cooldownMs = 8000;

  if (now - lastRequestTime < cooldownMs) {
    const retryAfterMs = cooldownMs - (now - lastRequestTime);
    return res.status(429).json({
      error: 'Too many requests.',
      retryAfterMs,
    });
  }

  lastRequestTimes.set(clientKey, now);

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