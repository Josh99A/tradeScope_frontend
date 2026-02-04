"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import SymbolInfoWidget from "@/components/market/SymbolInfoWidget";

const DEFAULT_SYMBOLS = [
  { label: "Bitcoin", symbol: "BINANCE:BTCUSDT" },
  { label: "Ethereum", symbol: "BINANCE:ETHUSDT" },
  { label: "Solana", symbol: "BINANCE:SOLUSDT" },
  { label: "XRP", symbol: "BINANCE:XRPUSDT" },
  { label: "Cardano", symbol: "BINANCE:ADAUSDT" },
  { label: "Avalanche", symbol: "BINANCE:AVAXUSDT" },
];

export default function SymbolInfoCarousel({
  symbols = DEFAULT_SYMBOLS,
  className = "",
  autoAdvanceMs = 5000,
}: {
  symbols?: { label: string; symbol: string }[];
  className?: string;
  autoAdvanceMs?: number;
}) {
  const items = useMemo(() => symbols.filter((item) => item.symbol), [symbols]);
  const [index, setIndex] = useState(0);

  const safeIndex = items.length ? index % items.length : 0;
  const active = items[safeIndex];

  const handlePrev = () => {
    if (items.length === 0) return;
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    if (items.length === 0) return;
    setIndex((prev) => (prev + 1) % items.length);
  };

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, autoAdvanceMs);
    return () => window.clearInterval(id);
  }, [items.length, autoAdvanceMs]);

  if (!active) return null;

  return (
    <section className={`space-y-3 ${className}`} aria-label="Symbol info">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ts-text-muted">
            Symbol Info
          </p>
          <p className="text-sm font-semibold text-ts-text-main">
            {active.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Previous symbol"
            onClick={handlePrev}
            className="rounded-full border border-ts-border bg-ts-bg-card"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Next symbol"
            onClick={handleNext}
            className="rounded-full border border-ts-border bg-ts-bg-card"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <SymbolInfoWidget symbol={active.symbol} />

      <div className="flex items-center justify-center gap-2">
        {items.map((item, idx) => (
          <button
            key={item.symbol}
            type="button"
            aria-label={`Show ${item.label}`}
            onClick={() => setIndex(idx)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              idx === safeIndex
                ? "bg-ts-primary"
                : "bg-ts-border hover:bg-ts-primary/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
