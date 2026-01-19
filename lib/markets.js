const CACHE_TTL_MS = 30_000;
const cache = new Map();

export const getMarkets = async (limit = 6, options = {}) => {
  const sparkline = options.sparkline ? "1" : "0";
  const cacheKey = `${limit}-${sparkline}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const response = await fetch(
    `/api/markets?limit=${limit}&sparkline=${sparkline}`
  );
  if (!response.ok) {
    throw new Error("Failed to load markets");
  }
  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: now });
  return data;
};
