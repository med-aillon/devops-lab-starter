const express = require('express');
const promClient = require('prom-client');

const app = express();
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

app.get('/health', (_req, res) => res.json({ ok: true }));

// Simple business endpoint
app.get('/hello', (_req, res) => res.send('Hello from DevOps Lab!'));

// Prometheus metrics
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}`));