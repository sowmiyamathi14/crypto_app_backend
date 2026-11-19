// Fallback data used when CoinGecko fails or rate-limits.

const coins = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 43210.55, market_cap: 846000000000, market_cap_rank: 1, total_volume: 21000000000, high_24h: 43800, low_24h: 42500, price_change_percentage_24h: 1.8, circulating_supply: 19600000, total_supply: 21000000 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2310.4, market_cap: 277000000000, market_cap_rank: 2, total_volume: 11000000000, high_24h: 2350, low_24h: 2250, price_change_percentage_24h: -0.9, circulating_supply: 120000000, total_supply: 120000000 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', current_price: 1.0, market_cap: 95000000000, market_cap_rank: 3, total_volume: 30000000000, high_24h: 1.001, low_24h: 0.999, price_change_percentage_24h: 0.01, circulating_supply: 95000000000, total_supply: 95000000000 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 312.8, market_cap: 48000000000, market_cap_rank: 4, total_volume: 900000000, high_24h: 318, low_24h: 305, price_change_percentage_24h: 2.4, circulating_supply: 153000000, total_supply: 153000000 },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 98.2, market_cap: 42000000000, market_cap_rank: 5, total_volume: 2500000000, high_24h: 101, low_24h: 94, price_change_percentage_24h: -3.1, circulating_supply: 430000000, total_supply: 570000000 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', current_price: 0.62, market_cap: 33000000000, market_cap_rank: 6, total_volume: 1200000000, high_24h: 0.64, low_24h: 0.6, price_change_percentage_24h: 0.7, circulating_supply: 53000000000, total_supply: 100000000000 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', current_price: 0.58, market_cap: 20000000000, market_cap_rank: 7, total_volume: 400000000, high_24h: 0.6, low_24h: 0.56, price_change_percentage_24h: -1.2, circulating_supply: 35000000000, total_supply: 45000000000 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', current_price: 0.092, market_cap: 13000000000, market_cap_rank: 8, total_volume: 600000000, high_24h: 0.095, low_24h: 0.089, price_change_percentage_24h: 4.5, circulating_supply: 142000000000, total_supply: 142000000000 },
];

const globalStats = {
  data: {
    active_cryptocurrencies: 10000,
    markets: 800,
    total_market_cap: { usd: 1650000000000 },
    total_volume: { usd: 68000000000 },
    market_cap_percentage: { btc: 51.3, eth: 16.8 },
    market_cap_change_percentage_24h_usd: 1.2,
  },
};

function coinDetail(id) {
  const c = coins.find((x) => x.id === id);
  if (!c) return null;
  return {
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: { large: c.image },
    description: { en: `${c.name} (mock data).` },
    market_cap_rank: c.market_cap_rank,
    market_data: {
      current_price: { usd: c.current_price },
      market_cap: { usd: c.market_cap },
      total_volume: { usd: c.total_volume },
      high_24h: { usd: c.high_24h },
      low_24h: { usd: c.low_24h },
      price_change_percentage_24h: c.price_change_percentage_24h,
      circulating_supply: c.circulating_supply,
      total_supply: c.total_supply,
    },
  };
}

// Generates a random-walk price series ending near the current price.
function chart(id, days) {
  const c = coins.find((x) => x.id === id) || coins[0];
  const points = Math.min(Math.max(Number(days) * 24, 24), 200);
  const stepMs = (Number(days) * 24 * 3600 * 1000) / points;
  const now = Date.now();
  let price = c.current_price * 0.95;
  const prices = [];
  for (let i = 0; i < points; i++) {
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    prices.push([Math.round(now - (points - i) * stepMs), price]);
  }
  prices[prices.length - 1][1] = c.current_price;
  return { prices };
}

module.exports = { coins, globalStats, coinDetail, chart };