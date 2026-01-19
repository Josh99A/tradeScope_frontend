"use client";

import React from "react";

export default function DepositAmountInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs text-ts-text-muted">Amount</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter amount"
        className="mt-2 w-full rounded-md bg-ts-input-bg border border-ts-input-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ts-primary"
        aria-invalid={!!error}
        aria-describedby={error ? "deposit-amount-error" : undefined}
      />
      <p
        id="deposit-amount-error"
        className={`mt-2 text-xs ${
          error ? "text-ts-danger" : "text-ts-text-muted"
        }`}
      >
        {error || "Minimum deposit amount is 1 unit."}
      </p>
    </div>
  );
}
