"use client";

import React from "react";
import AssetIcon from "@/components/ui/AssetIcon";

export default function DepositQRCode({
  asset,
  imageUrl,
}: {
  asset: string;
  imageUrl?: string | null;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-lg border border-ts-border bg-ts-bg-main p-4">
      <img
        src={imageUrl || "/globe.svg"}
        alt="Deposit QR"
        className="h-24 w-24 rounded-md border border-ts-border bg-white p-2 sm:h-28 sm:w-28"
      />
      <p className="flex items-center gap-2 text-xs text-ts-text-muted">
        Scan to deposit
        <AssetIcon symbol={asset} size={16} />
        <span className="sr-only">{asset}</span>
      </p>
    </div>
  );
}
