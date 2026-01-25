const CACHE_TTL_MS = 10 * 60_000;
const cache = new Map();
const inflight = new Map();

export const getMarkets = async (limit = 6, options = {}) => {
  const sparkline = options.sparkline ? "1" : "0";
  const cacheKey = `${limit}-${sparkline}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey);
  }

  const request = fetch(`/api/markets?limit=${limit}&sparkline=${sparkline}`)
    .then(async (response) => {
      if (!response.ok) {
        return cached?.data ?? [];
      }
      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })
    .catch(() => cached?.data ?? [])
    .finally(() => {
      inflight.delete(cacheKey);
    });

  inflight.set(cacheKey, request);
  return request;
};
