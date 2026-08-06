require('dotenv').config();
const express = require('express');
const {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} = require('prom-client');
const mongoose = require('mongoose');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 80;

// Prometheus registry
const register = new Registry();
collectDefaultMetrics({ register });

// Custom metrics
const httpRequestCount = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Middleware to track all requests
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    httpRequestCount.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
    end({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  next();
});

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.use('/todos', todosRouter);

function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Secret Area"');
    return res.status(401).send('Authentication required.');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'utf-8',
  );
  const [username, password] = credentials.split(':');

  if (username === process.env.USERNAME && password === process.env.PASSWORD) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Secret Area"');
  return res.status(401).send('Invalid username or password.');
}

app.get('/secret', basicAuth, (req, res) => {
  res.send(process.env.SECRET_MESSAGE);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
