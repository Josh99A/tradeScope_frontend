"use client";

import Card from "@/components/ui/Card";
import HoldingsRow, { HoldingItem } from "@/components/wallet/HoldingsRow";
import { Button } from "@/components/ui/Button";
import AssetIcon from "@/components/ui/AssetIcon";

type HoldingsListProps = {
  holdings: HoldingItem[];
  prices: Record<string, number>;
  loading: boolean;
  error: string | null;
  onDeposit: (asset: string) => void;
  onWithdraw: (asset: string) => void;
  onTrade: (asset: string) => void;
};

const formatUsd = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatBalance = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(value);
};

const getPrice = (
  asset: string,
  prices: Record<string, number>,
  fallback: number
) => {
  if (asset === "USD") return 1;
  if (Number.isFinite(fallback) && fallback > 0) return fallback;
  return prices[asset] || 0;
};

export default function HoldingsList({
  holdings,
  prices,
  loading,
  error,
  onDeposit,
  onWithdraw,
  onTrade,
}: HoldingsListProps) {
  if (loading) {
    return (
      <Card>
        <p className="text-sm text-ts-text-muted">Loading holdings...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-ts-danger">{error}</p>
      </Card>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ts-text-muted">No holdings yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ts-text-main">Holdings</h2>
        <span className="text-xs text-ts-text-muted">
          {holdings.length} assets
        </span>
      </div>

      <div className="mt-4 hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
            <tr>
              <th className="py-2 text-left font-medium">Asset</th>
              <th className="py-2 text-left font-medium">Balance</th>
              <th className="py-2 text-left font-medium">USD Price</th>
              <th className="py-2 text-left font-medium">USD Value</th>
              <th className="py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ts-border">
            {holdings.map((holding) => {
              const available = Number(holding.available) || 0;
              const locked = Number(holding.locked) || 0;
              const total = available + locked;
              const holdingRate =
                holding.usd_rate !== null && holding.usd_rate !== undefined
                  ? Number(holding.usd_rate)
                  : 0;
              const priceUsd = getPrice(holding.asset, prices, holdingRate);
              const holdingValue =
                holding.usd_value !== null && holding.usd_value !== undefined
                  ? Number(holding.usd_value)
                  : 0;
              const valueUsd = holdingValue || total * priceUsd;
              return (
                <HoldingsRow
                  key={holding.asset}
                  holding={holding}
                  priceUsd={priceUsd}
                  valueUsd={valueUsd}
                  onDeposit={onDeposit}
                  onWithdraw={onWithdraw}
                  onTrade={onTrade}
                  formatBalance={formatBalance}
                  formatUsd={formatUsd}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {holdings.map((holding) => {
          const available = Number(holding.available) || 0;
          const locked = Number(holding.locked) || 0;
          const total = available + locked;
          const holdingRate =
            holding.usd_rate !== null && holding.usd_rate !== undefined
              ? Number(holding.usd_rate)
              : 0;
          const priceUsd = getPrice(holding.asset, prices, holdingRate);
          const holdingValue =
            holding.usd_value !== null && holding.usd_value !== undefined
              ? Number(holding.usd_value)
              : 0;
          const valueUsd = holdingValue || total * priceUsd;
          const tradeDisabled = holding.asset === "USD";
          return (
            <div
              key={holding.asset}
              className="rounded-lg border border-ts-border bg-ts-bg-main p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AssetIcon symbol={holding.asset} size={36} />
                  <div>
                    <p className="sr-only">{holding.asset}</p>
                    <p className="text-xs text-ts-text-muted">
                      {formatBalance(available)} available
                      {locked > 0 ? ` - ${formatBalance(locked)} locked` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ts-text-main">
                    {formatBalance(total)}
                  </p>
                  <p className="text-xs text-ts-text-muted">
                    {priceUsd ? formatUsd(valueUsd) : "--"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => onDeposit(holding.asset)}
                  className="bg-ts-primary text-white hover:opacity-90"
                >
                  Deposit
                </Button>
                <Button
                  type="button"
                  onClick={() => onWithdraw(holding.asset)}
                  className="bg-ts-hover text-ts-text-main hover:bg-ts-active"
                >
                  Withdraw
                </Button>
                <Button
                  type="button"
                  onClick={() => onTrade(holding.asset)}
                  disabled={tradeDisabled}
                  className={`bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40 ${
                    tradeDisabled ? "opacity-60" : ""
                  }`}
                >
                  Trade
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ts-text-muted">
                <div>
                  <p>USD Price</p>
                  <p className="text-ts-text-main">
                    {priceUsd ? formatUsd(priceUsd) : "--"}
                  </p>
                </div>
                <div>
                  <p>USD Value</p>
                  <p className="text-ts-text-main">
                    {priceUsd ? formatUsd(valueUsd) : "--"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
