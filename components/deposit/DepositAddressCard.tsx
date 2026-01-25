"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function DepositAddressCard({
  address,
  network,
}: {
  address: string;
  network?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-lg border border-ts-border bg-ts-bg-main p-3">
      <label className="text-xs text-ts-text-muted">Deposit address</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={address}
          className="w-full rounded-md bg-ts-input-bg border border-ts-input-border px-3 py-2 text-sm text-ts-text-main"
          aria-label="Deposit address"
        />
        <Button
          type="button"
          onClick={handleCopy}
          className="w-full bg-ts-primary text-white hover:opacity-90 sm:w-auto"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-ts-text-muted">
        {network
          ? `Network: ${network}. Send only the selected asset to this address.`
          : "Send only the selected asset to this address."}
      </p>
    </div>
  );
}
