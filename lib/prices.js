import api from "@/lib/axios";

const CACHE_TTL_MS = 30_000;
const cache = new Map();
const inflight = new Map();

export const getPrices = async (assets = [], options = {}) => {
  const list = Array.isArray(assets) ? assets : [];
  const normalized = list.map((item) => String(item).toUpperCase()).filter(Boolean);
  const cacheKey = normalized.slice().sort().join(",") || "all";
  const now = Date.now();

  if (!options.forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    if (inflight.has(cacheKey)) {
      return inflight.get(cacheKey);
    }
  }

  const params = new URLSearchParams();
  if (normalized.length) {
    params.set("assets", normalized.join(","));
  }
  const query = params.toString();
  const request = api
    .get(`/prices${query ? `?${query}` : ""}`)
    .then((response) => {
      if (!response?.data?.prices || Object.keys(response.data.prices).length === 0) {
        console.warn("[Prices] Empty price payload", {
          assets: normalized,
          query,
          data: response?.data,
        });
      }
      cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      return response.data;
    })
    .catch((error) => {
      console.warn("[Prices] Fetch failed", {
        assets: normalized,
        query,
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      const cached = cache.get(cacheKey);
      if (cached) return cached.data;
      throw error;
    })
    .finally(() => {
      inflight.delete(cacheKey);
    });

  inflight.set(cacheKey, request);
  return request;
};
