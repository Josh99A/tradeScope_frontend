"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

export default function QuickTradePanel() {
  const [amount, setAmount] = useState("1000");

  return (
    <section className="bg-ts-bg-card rounded-xl border border-ts-border p-4">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-ts-text-main">
          Quick Trade
        </h2>
        <p className="text-xs text-ts-text-muted">
          Market execution
        </p>
      </header>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-xs text-ts-text-muted mb-1">
          Amount (Base currency)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={cn(
            "w-full rounded-md px-3 py-2",
            "bg-ts-bg-main border border-ts-border",
            "text-ts-text-main focus:outline-none focus:ring-1 focus:ring-ts-primary"
          )}
        />
      </div>

      {/* Buy / Sell */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className={cn(
            "rounded-lg py-3 font-semibold text-white transition",
            "bg-ts-success hover:opacity-90"
          )}
        >
          BUY
        </Button>

        <Button
          className={cn(
            "rounded-lg py-3 font-semibold text-white transition",
            "bg-ts-danger hover:opacity-90"
          )}
        >
          SELL
        </Button>
      </div>
    </section>
  );
}
