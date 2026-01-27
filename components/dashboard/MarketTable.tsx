"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "../ui/Card";
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

const MarketTable = () => {
  const [markets, setMarkets] = useState<MarketItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMarkets(6);
        setMarkets(data);
      } catch {
        setMarkets([]);
      }
    };
    load();
  }, []);

  return (
    <Card>
      <h3 className="mb-2 font-semibold">Markets</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] text-sm">
          <tbody>
            {markets.map((market) => {
              const change = market.change24h ?? 0;
              const isPositive = change >= 0;
              const tradeSymbol = `${market.symbol}USDT`;
              return (
                <tr key={market.id} className="border-b border-ts-border">
                  <td className="py-2">
                    <Link
                      href={`/dashboard/trade?symbol=${tradeSymbol}&quote=USDT`}
                      className="flex items-center gap-2 hover:text-ts-primary"
                    >
                      <AssetIcon symbol={market.symbol} size={20} />
                      <span className="sr-only">
                        {market.name} ({market.symbol})
                      </span>
                    </Link>
                  </td>
                  <td className="py-2">{formatPrice(market.price)}</td>
                  <td
                    className={`py-2 ${
                      isPositive ? "text-ts-success" : "text-ts-danger"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {change.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default MarketTable;
