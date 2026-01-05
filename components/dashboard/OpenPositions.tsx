"use client";

import { cn } from "@/lib/utils";

type Position = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  entry: number;
  current: number;
  pnl: number;
};

const mockPositions: Position[] = [
  {
    id: "1",
    symbol: "EUR/USD",
    side: "BUY",
    size: 1000,
    entry: 1.0824,
    current: 1.0851,
    pnl: 2.7,
  },
  {
    id: "2",
    symbol: "GBP/USD",
    side: "SELL",
    size: 500,
    entry: 1.2630,
    current: 1.2592,
    pnl: 1.9,
  },
];

export default function OpenPositions() {
  return (
    <section className="bg-ts-bg-card rounded-xl border border-ts-border p-4">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-ts-text-main">
          Open Positions
        </h2>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-ts-text-muted">
            <tr className="border-b border-ts-border">
              <th className="py-2 text-left">Pair</th>
              <th className="py-2 text-left">Side</th>
              <th className="py-2 text-right">Size</th>
              <th className="py-2 text-right">Entry</th>
              <th className="py-2 text-right">Current</th>
              <th className="py-2 text-right">PnL</th>
            </tr>
          </thead>

          <tbody>
            {mockPositions.map((pos) => (
              <tr
                key={pos.id}
                className="border-b border-ts-border last:border-none"
              >
                <td className="py-2 text-ts-text-main">{pos.symbol}</td>

                <td
                  className={cn(
                    "py-2 font-medium",
                    pos.side === "BUY"
                      ? "text-ts-success"
                      : "text-ts-danger"
                  )}
                >
                  {pos.side}
                </td>

                <td className="py-2 text-right text-ts-text-main">
                  {pos.size.toLocaleString()}
                </td>

                <td className="py-2 text-right text-ts-text-muted">
                  {pos.entry.toFixed(4)}
                </td>

                <td className="py-2 text-right text-ts-text-muted">
                  {pos.current.toFixed(4)}
                </td>

                <td
                  className={cn(
                    "py-2 text-right font-medium",
                    pos.pnl >= 0 ? "text-ts-success" : "text-ts-danger"
                  )}
                >
                  {pos.pnl >= 0 ? "+" : ""}
                  {pos.pnl.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
