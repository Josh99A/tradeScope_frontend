"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMarkets } from "@/lib/markets";

type MarketItem = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number | null;
};

const formatPrice = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

export default function LiveMarketGrid({ limit = 3 }: { limit?: number }) {
  const [items, setItems] = useState<MarketItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMarkets(limit);
        setItems(data);
      } catch {
        setItems([]);
      }
    };
    load();
  }, [limit]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item) => {
        const change = item.change24h ?? 0;
        const isPositive = change >= 0;
        const tradeSymbol = `${item.symbol}USDT`;
        return (
          <Link
            key={item.id}
            href={`/dashboard/trade?symbol=${tradeSymbol}&quote=USDT`}
            className="bg-ts-bg-card border border-ts-border rounded-xl p-6 hover:border-ts-primary transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm text-ts-text-muted">{item.name}</p>
                <p className="text-xs text-ts-text-muted">{item.symbol}</p>
              </div>
            </div>
            <p className="text-xl font-semibold mt-4">
              {formatPrice(item.price)}
            </p>
            <p
              className={
                isPositive ? "text-ts-success text-sm" : "text-ts-danger text-sm"
              }
            >
              {isPositive ? "+" : ""}
              {change.toFixed(2)}%
            </p>
          </Link>
        );
      })}
    </div>
  );
}
