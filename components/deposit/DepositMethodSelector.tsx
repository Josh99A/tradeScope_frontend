"use client";

import React from "react";

const ASSETS = [
  { code: "USDC", label: "USDC" },
  { code: "USDT", label: "USDT" },
  { code: "ETH", label: "Ethereum" },
  { code: "BTC", label: "Bitcoin" },
  { code: "XRP", label: "XRP" },
  { code: "DOGE", label: "Dogecoin" },
];

export type DepositAsset = (typeof ASSETS)[number]["code"];

export default function DepositMethodSelector({
  value,
  onChange,
}: {
  value: DepositAsset;
  onChange: (asset: DepositAsset) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ASSETS.map((asset) => {
        const isActive = asset.code === value;
        return (
          <button
            key={asset.code}
            type="button"
            onClick={() => onChange(asset.code)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
              isActive
                ? "border-ts-primary bg-ts-primary/10 text-ts-text-main"
                : "border-ts-border bg-ts-bg-main text-ts-text-muted hover:border-ts-primary/50"
            }`}
            aria-pressed={isActive}
          >
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                isActive
                  ? "bg-ts-primary text-white"
                  : "bg-ts-hover text-ts-text-main"
              }`}
            >
              {asset.code}
            </span>
            <span className="font-medium">{asset.label}</span>
          </button>
        );
      })}
    </div>
  );
}
