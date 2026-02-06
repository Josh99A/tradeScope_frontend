import { NextResponse } from "next/server";

const COINCAP_BASE_URL = "https://rest.coincap.io/v3";
const COINCAP_API_KEY = process.env.COINCAP_API_KEY || "";
const PRICE_TTL_MS = 5 * 1000;
const priceCache = new Map<string, { price: number; expiresAt: number }>();
const RATE_LIMIT_NOTIFY_COOLDOWN_MS = 10 * 60 * 1000;
let lastRateLimitNotifyAt = 0;

const notifyAdminsRateLimited = async (symbols: string[]) => {
  const token = process.env.ADMIN_NOTIFY_TOKEN || "";
  const backendUrl = process.env.BACKEND_URL || "";
  if (!token || !backendUrl) return;
  const now = Date.now();
  if (now - lastRateLimitNotifyAt < RATE_LIMIT_NOTIFY_COOLDOWN_MS) return;
  lastRateLimitNotifyAt = now;
  try {
    await fetch(`${backendUrl}/api/system/notify-admins/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Notify-Token": token,
      },
      body: JSON.stringify({
        action: "rate_limited",
        metadata: {
          provider: "CoinCap",
          symbols,
          occurred_at: new Date().toISOString(),
        },
      }),
    });
  } catch {
    // swallow notification errors
  }
};

const fetchCoinCapPrices = async (symbols: string[]) => {
  const headers = COINCAP_API_KEY
    ? { Authorization: `Bearer ${COINCAP_API_KEY}` }
    : undefined;
  const now = Date.now();
  const cached: Record<string, number> = {};
  const toFetch: string[] = [];
  const COINCAP_ID_MAP: Record<string, string> = {
    ADA: "cardano",
    AVAX: "avalanche",
    BCH: "bitcoin-cash",
    BNB: "binance-coin",
    BTC: "bitcoin",
    DOGE: "dogecoin",
    DOT: "polkadot",
    ETH: "ethereum",
    LINK: "chainlink",
    LTC: "litecoin",
    MATIC: "polygon",
    SOL: "solana",
    TRX: "tron",
    XRP: "xrp",
  };

  symbols.forEach((symbol) => {
    const key = symbol.toUpperCase();
    const entry = priceCache.get(key);
    if (entry && entry.expiresAt > now) {
      cached[key] = entry.price;
    } else {
      toFetch.push(key);
    }
  });

  if (toFetch.length === 0) {
    console.debug("[CoinCap] Cache hit", {
      symbols,
      cachedCount: Object.keys(cached).length,
    });
    return { prices: cached, rateLimited: false };
  }

  const byId = toFetch
    .map((symbol) => ({ symbol, id: COINCAP_ID_MAP[symbol] }))
    .filter((item) => item.id);
  const bySymbol = toFetch.filter((symbol) => !COINCAP_ID_MAP[symbol]);

  const prices: Record<string, number> = { ...cached };
  let rateLimited = false;

  if (byId.length > 0) {
    const idsParam = byId.map((item) => item.id).join(",");
    const res = await fetch(
      `${COINCAP_BASE_URL}/assets?ids=${encodeURIComponent(idsParam)}`,
      { headers, cache: "no-store" }
    );
    if (res.status === 429) {
      rateLimited = true;
      console.warn("[CoinCap] Rate limited on /assets", { ids: idsParam });
    } else if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : [];
      if (list.length === 0) {
        console.warn("[CoinCap] Empty /assets response", { ids: idsParam, data });
      }
      list.forEach((row: { id?: string; priceUsd?: string }) => {
        const id = row?.id;
        const price = Number(row?.priceUsd);
        if (!id || !Number.isFinite(price)) return;
        const match = byId.find((item) => item.id === id);
        if (!match) return;
        prices[match.symbol] = price;
        priceCache.set(match.symbol, {
          price,
          expiresAt: now + PRICE_TTL_MS,
        });
      });
    } else {
      console.warn("[CoinCap] /assets fetch failed", {
        status: res.status,
        ids: idsParam,
      });
    }
  }

  const requests = bySymbol.map(async (symbol) => {
    const res = await fetch(
      `${COINCAP_BASE_URL}/price/bysymbol/${encodeURIComponent(symbol)}`,
      { headers, cache: "no-store" }
    );
    if (res.status === 429) {
      return { symbol, rateLimited: true } as const;
    }
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.data)) return null;
    const price = Number(data.data[0]);
    if (!Number.isFinite(price)) return null;
    return { symbol, price };
  });

  const results = await Promise.all(requests);
  results.forEach((result) => {
    if (!result) return;
    if ("rateLimited" in result && result.rateLimited) {
      rateLimited = true;
      return;
    }
    prices[result.symbol] = result.price;
    priceCache.set(result.symbol, {
      price: result.price,
      expiresAt: now + PRICE_TTL_MS,
    });
  });
  if (rateLimited) {
    notifyAdminsRateLimited(toFetch);
  }
  if (Object.keys(prices).length === 0) {
    console.warn("[CoinCap] No prices returned", { symbols, byId, bySymbol });
  }
  return { prices, rateLimited };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assetsParam = searchParams.get("assets") || "";
  const symbols = assetsParam
    .split(",")
    .map((asset) => asset.trim().toUpperCase())
    .filter(Boolean);

  console.debug("[CoinCap] Price request", {
    assetsParam,
    symbols,
    hasKey: Boolean(COINCAP_API_KEY),
  });
  const prices: Record<string, number> = {};
  if (symbols.includes("USD")) {
    prices.USD = 1;
  }

  const targetSymbols = symbols.filter((symbol) => symbol !== "USD");

  if (targetSymbols.length === 0) {
    return NextResponse.json({ prices });
  }

  try {
    const result = await fetchCoinCapPrices(targetSymbols);
    if (result && "prices" in result) {
      Object.assign(prices, result.prices || {});
    }
    if (Object.keys(prices).length === 0) {
      console.warn("[CoinCap] Response empty after fetch", {
        targetSymbols,
        rateLimited: result?.rateLimited,
      });
    }
    return NextResponse.json({
      prices,
      rate_limited: result?.rateLimited || false,
    });
  } catch (error) {
    console.error("[CoinCap] Price fetch error", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { detail: "Unable to fetch prices." },
      { status: 502 }
    );
  }
}
