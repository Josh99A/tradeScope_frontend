"use client";

import Card from "@/components/ui/Card";
import { formatAmount } from "@/lib/formatters";

type TradeItem = {
  id?: number | string;
  symbol?: string;
  volume?: number | string;
  pnl?: number | string;
  status?: string;
  opened_at?: string;
  closed_at?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatPnl = (value?: number | string) => {
  if (value === null || value === undefined || value === "") return "--";
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(numeric);
};

export default function TradeHistoryTable({ items }: { items: TradeItem[] }) {
  const orderedItems = [...items].sort((a, b) => {
    const timeA = a.opened_at ? new Date(a.opened_at).getTime() : 0;
    const timeB = b.opened_at ? new Date(b.opened_at).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ts-text-main">Trade history</h2>
        <span className="text-xs text-ts-text-muted">{items.length} records</span>
      </div>

      {orderedItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">No trades recorded.</p>
      ) : (
        <>
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
                <tr>
                  <th className="py-2 text-left font-medium">Opened</th>
                  <th className="py-2 text-left font-medium">Symbol</th>
                  <th className="py-2 text-left font-medium">Volume</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-left font-medium">PnL</th>
                  <th className="py-2 text-left font-medium">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ts-border">
                {orderedItems.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td className="py-3 pr-4">{formatDate(item.opened_at)}</td>
                    <td className="py-3 pr-4">{item.symbol || "--"}</td>
                    <td className="py-3 pr-4">{formatAmount(item.volume)}</td>
                    <td className="py-3 pr-4">{item.status || "--"}</td>
                    <td className="py-3 pr-4">{formatPnl(item.pnl)}</td>
                    <td className="py-3 pr-4">{formatDate(item.closed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 md:hidden">
            {orderedItems.map((item, index) => (
              <div
                key={item.id ?? index}
                className="rounded-lg border border-ts-border bg-ts-bg-main p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-ts-text-muted">
                      Opened: {formatDate(item.opened_at)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ts-text-main">
                      {item.symbol || "--"}
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      Volume:{" "}
                      <span className="text-ts-text-main">
                        {formatAmount(item.volume)}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      Status:{" "}
                      <span className="text-ts-text-main">
                        {item.status || "--"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      PnL:{" "}
                      <span className="text-ts-text-main">
                        {formatPnl(item.pnl)}
                      </span>
                    </p>
                  </div>
                  <div className="text-xs text-ts-text-muted">
                    Closed: {formatDate(item.closed_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
