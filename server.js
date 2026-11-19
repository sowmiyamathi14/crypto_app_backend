const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mock = require('./mockdata');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const CG = 'https://api.coingecko.com/api/v3';
const cache = {};

// If CoinGecko fails (slow, blocked, rate limited), skip it for 60 seconds
// and serve cached/mock data right away so the app never waits.
let cgDownUntil = 0;

async function getData(key, url, mockFn, ttl = 60000) {
  const hit = cache[key];
  if (hit && Date.now() - hit.time < ttl) return { data: hit.data, source: 'cache' };

  if (Date.now() >= cgDownUntil) {
    try {
      const { data } = await axios.get(url, { timeout: 4000 });
      cache[key] = { data, time: Date.now() };
      return { data, source: 'live' };
    } catch (err) {
      console.log(`CoinGecko failed for ${key}: ${err.message}`);
      cgDownUntil = Date.now() + 60000;
    }
  }

  if (hit) return { data: hit.data, source: 'stale-cache' };

  const fallback = mockFn();
  if (fallback) return { data: fallback, source: 'mock' };

  throw new Error(`No data available for ${key}`);
}

function send(res, { data, source }) {
  res.set('X-Data-Source', source);
  res.json(data);
}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    endpoints: [
      '/api/coins',
      '/api/coins/:id',
      '/api/coins/:id/chart?days=7',
      '/api/market/stats',
    ],
  });
});

// 1. Coin list
app.get('/api/coins', async (req, res) => {
  try {
    const result = await getData(
      'coins',
      `${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&price_change_percentage=24h`,
      () => mock.coins
    );
    send(res, result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch coins' });
  }
});

// 2. Coin details
app.get('/api/coins/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await getData(
      `detail-${id}`,
      `${CG}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,
      () => mock.coinDetail(id)
    );
    send(res, result);
  } catch (e) {
    res.status(404).json({ error: 'Coin not found or failed to fetch' });
  }
});

// 3. Chart data
app.get('/api/coins/:id/chart', async (req, res) => {
  const { id } = req.params;
  const days = req.query.days || 7;
  try {
    const result = await getData(
      `chart-${id}-${days}`,
      `${CG}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
      () => mock.chart(id, days)
    );
    send(res, result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

// 4. Market stats
app.get('/api/market/stats', async (req, res) => {
  try {
    const result = await getData('global', `${CG}/global`, () => mock.globalStats);
    send(res, result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch market stats' });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));