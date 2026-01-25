"use client";

import { Button } from "@/components/ui/Button";
import AssetIcon from "@/components/ui/AssetIcon";

export type HoldingItem = {
  asset: string;
  available: number | string;
  locked: number | string;
  usd_rate?: number | string | null;
  usd_value?: number | string | null;
};

type HoldingsRowProps = {
  holding: HoldingItem;
  priceUsd: number;
  valueUsd: number;
  onDeposit: (asset: string) => void;
  onWithdraw: (asset: string) => void;
  onTrade: (asset: string) => void;
  formatBalance: (value: number) => string;
  formatUsd: (value: number) => string;
};

export default function HoldingsRow({
  holding,
  priceUsd,
  valueUsd,
  onDeposit,
  onWithdraw,
  onTrade,
  formatBalance,
  formatUsd,
}: HoldingsRowProps) {
  const available = Number(holding.available) || 0;
  const locked = Number(holding.locked) || 0;
  const total = available + locked;
  const tradeDisabled = holding.asset === "USD";

  return (
    <tr>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <AssetIcon symbol={holding.asset} size={28} />
          <div>
            <p className="sr-only">{holding.asset}</p>
            <p className="text-xs text-ts-text-muted">
              {formatBalance(available)} available
              {locked > 0 ? ` - ${formatBalance(locked)} locked` : ""}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 text-sm text-ts-text-main">
        {formatBalance(total)}
      </td>
      <td className="py-3 pr-4 text-sm text-ts-text-main">
        {priceUsd ? formatUsd(priceUsd) : "--"}
      </td>
      <td className="py-3 pr-4 text-sm font-semibold text-ts-text-main">
        {priceUsd ? formatUsd(valueUsd) : "--"}
      </td>
      <td className="py-3">
        <div className="flex flex-wrap gap-2">
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
      </td>
    </tr>
  );
}
