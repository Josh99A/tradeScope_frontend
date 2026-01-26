import api from "@/lib/axios";

const CACHE_TTL_MS = {
  wallet: 2 * 60_000,
  holdings: 5 * 60_000,
  deposits: 2 * 60_000,
  withdrawals: 2 * 60_000,
  activity: 2 * 60_000,
};
const cache = new Map();
const inflight = new Map();

const readCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

const writeCache = (key, data, ttl) => {
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

const clearCache = (keys) => {
  keys.forEach((key) => cache.delete(key));
};

const cachedGet = async (key, ttl, fetcher, options = {}) => {
  if (!options.forceRefresh) {
    const cached = readCache(key);
    if (cached) return cached;
    if (inflight.has(key)) return inflight.get(key);
  }
  const request = fetcher()
    .then((data) => {
      writeCache(key, data, ttl);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, request);
  return request;
};

const ensureValidId = (id) => {
  if (id === null || id === undefined) {
    throw new Error("Invalid activity id");
  }
  const text = String(id).trim().toLowerCase();
  if (!text || text === "undefined" || text === "null") {
    throw new Error("Invalid activity id");
  }
  return id;
};

export const getWallet = async (options = {}) => {
  return cachedGet(
    "wallet",
    CACHE_TTL_MS.wallet,
    async () => {
      const response = await api.get("/wallet/");
      return response.data;
    },
    options
  );
};

export const getWalletSnapshot = async (options = {}) => {
  const [wallet, holdings] = await Promise.all([
    getWallet(options),
    getHoldings(options),
  ]);

  return { wallet, holdings };
};

export const depositFunds = async ({ amount, asset_id, usd_amount }) => {
  const response = await api.post("/wallet/deposit/", {
    amount,
    asset_id,
    ...(usd_amount !== undefined && usd_amount !== null ? { usd_amount } : {}),
  });
  clearCache(["wallet", "holdings", "deposits", "activity"]);
  return response.data;
};

export const withdrawFunds = async ({
  amount,
  asset_id,
  fee,
  address,
  network,
  usd_amount,
  proof,
}) => {
  const formData = new FormData();
  formData.append("amount", String(amount));
  if (asset_id) formData.append("asset_id", String(asset_id));
  if (fee !== undefined) formData.append("fee", String(fee));
  if (address) formData.append("address", address);
  if (network) formData.append("network", network);
  if (usd_amount !== undefined && usd_amount !== null) formData.append("usd_amount", String(usd_amount));
  if (proof) formData.append("proof", proof);
  const response = await api.post("/wallet/withdraw/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearCache(["wallet", "holdings", "withdrawals", "activity"]);
  return response.data;
};

export const getWalletActivity = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.includeArchived) params.set("include_archived", "true");
  if (options.includeDeleted) params.set("include_deleted", "true");
  const query = params.toString();
  const key = `activity:${query}`;
  return cachedGet(
    key,
    CACHE_TTL_MS.activity,
    async () => {
      const response = await api.get(
        `/wallet/activity/${query ? `?${query}` : ""}`
      );
      return response.data;
    },
    options
  );
};

export const archiveWalletActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/wallet/activity/${safeId}/archive/`, null);
  clearCache(["activity"]);
  return response.data;
};

export const restoreWalletActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/wallet/activity/${safeId}/restore/`, null);
  clearCache(["activity"]);
  return response.data;
};

export const deleteWalletActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/wallet/activity/${safeId}/delete/`, null);
  clearCache(["activity"]);
  return response.data;
};

export const getDeposits = async (options = {}) => {
  return cachedGet(
    "deposits",
    CACHE_TTL_MS.deposits,
    async () => {
      const response = await api.get("/deposits/");
      return response.data;
    },
    options
  );
};

export const getWithdrawals = async (options = {}) => {
  return cachedGet(
    "withdrawals",
    CACHE_TTL_MS.withdrawals,
    async () => {
      const response = await api.get("/withdrawals/");
      return response.data;
    },
    options
  );
};

export const getHoldings = async (options = {}) => {
  return cachedGet(
    "holdings",
    CACHE_TTL_MS.holdings,
    async () => {
      const response = await api.get("/holdings/");
      return response.data;
    },
    options
  );
};
