"use client";

import React from "react";

export default function DepositQRCode({ asset }: { asset: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-ts-border bg-ts-bg-main p-4">
      <img
        src="/globe.svg"
        alt={`${asset} deposit QR`}
        className="h-28 w-28 rounded-md border border-ts-border bg-white p-2"
      />
      <p className="text-xs text-ts-text-muted">
        Scan to deposit {asset}
      </p>
    </div>
  );
}
