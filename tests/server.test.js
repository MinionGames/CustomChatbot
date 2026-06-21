const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createApp } = require('../backend/server');

test('POST /chat returns 400 for missing message', async () => {
  const app = createApp({
    anthropicClient: {
      messages: {
        create: async () => ({ content: [{ type: 'text', text: 'unused' }] })
      }
    }
  });

  const response = await request(app)
    .post('/chat')
    .send({});

  assert.equal(response.status, 400);
  assert.match(response.body.error, /message/i);
});

test('POST /chat returns model reply text', async () => {
  const app = createApp({
    anthropicClient: {
      messages: {
        create: async () => ({
          content: [
            { type: 'text', text: 'Hello from Claude' }
          ]
        })
      }
    }
  });

  const response = await request(app)
    .post('/chat')
    .send({ message: 'Hi' });

  assert.equal(response.status, 200);
  assert.equal(response.body.reply, 'Hello from Claude');
});

test('POST /chat returns 500 when Anthropic request fails', async () => {
  const app = createApp({
    anthropicClient: {
      messages: {
        create: async () => {
          throw new Error('Anthropic offline');
        }
      }
    }
  });

  const response = await request(app)
    .post('/chat')
    .send({ message: 'Hi' });

  assert.equal(response.status, 500);
  assert.match(response.body.error, /failed/i);
});
