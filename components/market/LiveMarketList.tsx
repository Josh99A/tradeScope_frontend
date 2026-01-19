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

export default function LiveMarketList({ limit = 5 }: { limit?: number }) {
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
    <div className="bg-ts-bg-card border border-ts-border rounded-xl p-5">
      <h3 className="text-sm mb-3">Top Markets</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const change = item.change24h ?? 0;
          const isPositive = change >= 0;
          const tradeSymbol = `${item.symbol}USDT`;
          return (
            <Link
              key={item.id}
              href={`/dashboard/trade?symbol=${tradeSymbol}&quote=USDT`}
              className="flex justify-between items-center rounded-md px-2 py-1 hover:bg-ts-hover"
            >
              <div className="flex items-center gap-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-6 w-6 rounded-full"
                />
                <span className="text-sm font-medium">{item.symbol}</span>
              </div>
              <div className="text-right">
                <p className="text-sm">{formatPrice(item.price)}</p>
                <p
                  className={
                    isPositive
                      ? "text-xs text-ts-success"
                      : "text-xs text-ts-danger"
                  }
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)}%
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
