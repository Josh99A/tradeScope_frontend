import { NextResponse } from "next/server";

type MarketItem = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
};

type CacheEntry = {
  key: string;
  timestamp: number;
  data: unknown;
};

const CACHE_TTL_MS = 90_000;
const RATE_LIMIT_COOLDOWN_MS = 2 * 60_000;
let cache: CacheEntry | null = null;
let lastRateLimitAt = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit") || "6");
  const sparklineParam = searchParams.get("sparkline") === "1";
  const perPage = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 20)
    : 6;
  const cacheKey = `${perPage}-${sparklineParam ? "spark" : "nospark"}`;
  const now = Date.now();

  if (cache && cache.key === cacheKey && now - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cache.data);
  }

  if (lastRateLimitAt && now - lastRateLimitAt < RATE_LIMIT_COOLDOWN_MS) {
    return NextResponse.json(cache?.data ?? []);
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=${
      sparklineParam ? "true" : "false"
    }&price_change_percentage=24h`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    if (res.status === 429) {
      lastRateLimitAt = now;
      return NextResponse.json(cache?.data ?? []);
    }
    if (cache && cache.key === cacheKey) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json(
      { detail: "Failed to load market data." },
      { status: 200 }
    );
  }

  const data = (await res.json()) as MarketItem[];
  const payload = data.map((item) => ({
    id: item.id,
    symbol: item.symbol?.toUpperCase(),
    name: item.name,
    image: item.image,
    price: item.current_price,
    change24h: item.price_change_percentage_24h,
    sparkline: sparklineParam ? item.sparkline_in_7d?.price ?? [] : [],
  }));

  cache = { key: cacheKey, timestamp: now, data: payload };
  return NextResponse.json(payload);
}
