"use client";

import { useEffect, useMemo, useState } from "react";
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
  sparkline: number[];
};

const formatPrice = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

const Sparkline = ({ data }: { data: number[] }) => {
  const points = useMemo(() => {
    if (!data.length) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg viewBox="0 0 100 100" className="h-10 w-24">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

export default function LiveTickerTable({ limit = 8 }: { limit?: number }) {
  const [items, setItems] = useState<MarketItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMarkets(limit, { sparkline: true });
        setItems(data);
      } catch {
        setItems([]);
      }
    };
    load();
  }, [limit]);

  return (
    <div className="rounded-xl border border-ts-border bg-ts-bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Market Tickers</h3>
        <span className="text-xs text-ts-text-muted">Live</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
            <tr>
              <th className="py-2 text-left font-medium">Asset</th>
              <th className="py-2 text-left font-medium">Price</th>
              <th className="py-2 text-left font-medium">24h</th>
              <th className="py-2 text-left font-medium">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ts-border">
            {items.map((item) => {
              const change = item.change24h ?? 0;
              const isPositive = change >= 0;
              const tradeSymbol = `${item.symbol}USDT`;
              return (
                <tr key={item.id}>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/dashboard/trade?symbol=${tradeSymbol}&quote=USDT`}
                      className="flex items-center gap-2 hover:text-ts-primary"
                    >
                      <AssetIcon symbol={item.symbol} size={24} />
                      <span className="sr-only">
                        {item.name} ({item.symbol})
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{formatPrice(item.price)}</td>
                  <td
                    className={`py-3 pr-4 ${
                      isPositive ? "text-ts-success" : "text-ts-danger"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {change.toFixed(2)}%
                  </td>
                  <td className="py-3 text-ts-primary">
                    <Sparkline data={item.sparkline.slice(-24)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
