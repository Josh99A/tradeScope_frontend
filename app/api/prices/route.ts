import { NextResponse } from "next/server";

const COINCAP_BASE_URL = "https://rest.coincap.io/v3";
const COINCAP_API_KEY = process.env.COINCAP_API_KEY || "";
const PRICE_TTL_MS = 120 * 1000;
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
    return cached;
  }

  const requests = toFetch.map(async (symbol) => {
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
  const prices: Record<string, number> = { ...cached };
  let rateLimited = false;
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
  return { prices, rateLimited };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assetsParam = searchParams.get("assets") || "";
  const symbols = assetsParam
    .split(",")
    .map((asset) => asset.trim().toUpperCase())
    .filter(Boolean);

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
    if (result) {
      Object.assign(prices, result.prices || {});
    }
    return NextResponse.json({
      prices,
      rate_limited: result?.rateLimited || false,
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to fetch prices." },
      { status: 502 }
    );
  }
}
