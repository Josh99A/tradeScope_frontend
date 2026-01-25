"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMarkets } from "@/lib/markets";
import AssetIcon from "@/components/ui/AssetIcon";

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

export default function LiveMarketHero() {
  const [items, setItems] = useState<MarketItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMarkets(5);
        setItems(data);
      } catch {
        setItems([]);
      }
    };
    load();
  }, []);

  return (
    <div className="relative h-72 lg:h-96 rounded-xl bg-ts-bg-card border border-ts-border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ts-text-muted">
            Live Markets
          </p>
          <h3 className="text-xl font-semibold text-ts-text-main">
            Top Crypto Movers
          </h3>
        </div>
        <span className="text-xs text-ts-text-muted">24h</span>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const change = item.change24h ?? 0;
          const isPositive = change >= 0;
          const tradeSymbol = `${item.symbol}USDT`;
          return (
            <Link
              key={item.id}
              href={`/dashboard/trade?symbol=${tradeSymbol}&quote=USDT`}
              className="flex items-center justify-between rounded-lg border border-ts-border bg-ts-bg-main px-4 py-3 hover:border-ts-primary/60 hover:bg-ts-hover"
            >
              <div className="flex items-center gap-3">
                <AssetIcon symbol={item.symbol} size={32} />
                <span className="sr-only">
                  {item.name} ({item.symbol})
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatPrice(item.price)}
                </p>
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
