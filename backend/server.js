require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

function createApp(options = {}) {
  const app = express();
  const anthropicClient = options.anthropicClient
    || (process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null);

  app.use(cors());
  app.use(express.json());

  app.post('/chat', async (req, res) => {
    const message = req.body?.message;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'A non-empty "message" string is required.'
      });
    }

    if (!anthropicClient) {
      return res.status(500).json({
        error: 'Server is missing ANTHROPIC_API_KEY configuration.'
      });
    }

    try {
      const response = await anthropicClient.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
        max_tokens: 512,
        messages: [{ role: 'user', content: message }]
      });

      const reply = (response.content || [])
        .filter((item) => item.type === 'text')
        .map((item) => item.text)
        .join('\n')
        .trim();

      return res.json({ reply });
    } catch (error) {
      console.error('Anthropic request failed:', error);
      return res.status(500).json({
        error: 'Failed to generate chat response.'
      });
    }
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = { app, createApp };