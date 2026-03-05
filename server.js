require('dotenv').config();
const express = require('express');
const path = require('path');
const { scaffold } = require('./core/db');

let app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/gate'));
app.use('/api/ai', require('./routes/pulse'));
app.use('/api/trades', require('./routes/desk'));
app.use('/api/signals', require('./routes/feed'));
app.use('/api/notifications', require('./routes/wire'));
app.use('/api/market', require('./routes/chart'));
app.use('/api/news', require('./routes/digest'));
app.use('/api/analytics', require('./routes/stats'));
app.use('/api/backtest', require('./routes/replay'));

app.get('/api/health', (req, res) => res.json({ status: 'alive', ts: Date.now() }));

let landingDir = path.join(__dirname, 'landing');
let clientDist = path.join(__dirname, 'client', 'dist');

app.use('/app', express.static(clientDist));

app.use('/assets', express.static(path.join(clientDist, 'assets')));

app.get('/app/*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(express.static(landingDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(landingDir, 'index.html'));
});

let port = process.env.PORT || 3000;

scaffold()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`kotvukai up on :${port}`);
    });
  })
  .catch(e => {
    console.error('db scaffold failed:', e.message);
    app.listen(port, '0.0.0.0', () => {
      console.log(`kotvukai up on :${port} (db might be down)`);
    });
  });
