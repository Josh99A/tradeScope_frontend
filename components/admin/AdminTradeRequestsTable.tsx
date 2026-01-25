"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import AssetIcon from "@/components/ui/AssetIcon";
import { formatAmount } from "@/lib/formatters";

type TradeRequestItem = {
  id?: number | string;
  user?: {
    id?: number | string;
    email?: string;
    username?: string;
    display_name?: string;
  };
  symbol?: string;
  network?: string;
  side?: string;
  quote_symbol?: string;
  status?: string;
  requested_amount_asset?: number | string;
  requested_amount_usd?: number | string;
  conversion_rate_used?: number | string;
  user_note?: string;
  admin_note?: string;
  rejection_reason?: string;
  executed_price?: number | string;
  executed_amount_asset?: number | string;
  profit_or_loss_usd?: number | string;
  created_at?: string;
  executed_at?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const getUserLabel = (user?: TradeRequestItem["user"]) => {
  if (!user) return "--";
  return user.display_name || user.username || user.email || "--";
};

export default function AdminTradeRequestsTable({
  items,
  onExecute,
  onReject,
}: {
  items: TradeRequestItem[];
  onExecute: (id: number | string, payload: {
    executed_price: string;
    executed_amount_asset: string;
    profit_or_loss_usd: string;
    admin_note?: string;
  }) => Promise<void>;
  onReject: (id: number | string, reason: string) => Promise<void>;
}) {
  const [executeOpen, setExecuteOpen] = useState(false);
  const [selected, setSelected] = useState<TradeRequestItem | null>(null);
  const [form, setForm] = useState({
    executed_price: "",
    executed_amount_asset: "",
    profit_or_loss_usd: "",
    admin_note: "",
  });

  const openExecute = (item: TradeRequestItem) => {
    setSelected(item);
    setForm({
      executed_price:
        item.conversion_rate_used !== undefined && item.conversion_rate_used !== null
          ? String(item.conversion_rate_used)
          : "",
      executed_amount_asset:
        item.requested_amount_asset !== undefined &&
        item.requested_amount_asset !== null
          ? String(item.requested_amount_asset)
          : "",
      profit_or_loss_usd: "",
      admin_note: "",
    });
    setExecuteOpen(true);
  };

  const handleReject = async (item: TradeRequestItem) => {
    if (!item.id) return;
    const reason = window.prompt("Reason for rejection?");
    if (!reason) return;
    await onReject(item.id, reason);
  };

  const orderedItems = [...items].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ts-text-main">Trade requests</h2>
        <span className="text-xs text-ts-text-muted">{items.length} records</span>
      </div>

      {orderedItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">No trade requests.</p>
      ) : (
        <>
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
                <tr>
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-left font-medium">User</th>
                  <th className="py-2 text-left font-medium">Side</th>
                  <th className="py-2 text-left font-medium">Asset</th>
                  <th className="py-2 text-left font-medium">Amount</th>
                  <th className="py-2 text-left font-medium">USD</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ts-border">
                {orderedItems.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                    <td className="py-3 pr-4">{getUserLabel(item.user)}</td>
                    <td className="py-3 pr-4">{item.side}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <AssetIcon symbol={item.symbol} size={20} />
                        <span className="sr-only">
                          {item.symbol} {item.network ? `(${item.network})` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{formatAmount(item.requested_amount_asset)}</td>
                    <td className="py-3 pr-4">{formatAmount(item.requested_amount_usd)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => openExecute(item)}
                          disabled={String(item.status) !== "PENDING_REVIEW"}
                          className="bg-ts-success text-white hover:opacity-90"
                        >
                          Execute
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleReject(item)}
                          disabled={String(item.status) !== "PENDING_REVIEW"}
                          className="bg-ts-danger text-white hover:opacity-90"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
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
                      {formatDate(item.created_at)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ts-text-main">
                      {getUserLabel(item.user)}
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      {item.side}
                      <span className="ml-2 inline-flex items-center gap-2">
                        <AssetIcon symbol={item.symbol} size={18} />
                        <span className="sr-only">
                          {item.symbol} {item.network ? `(${item.network})` : ""}
                        </span>
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      Amount: <span className="text-ts-text-main">{formatAmount(item.requested_amount_asset)}</span>
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      USD: <span className="text-ts-text-main">{formatAmount(item.requested_amount_usd)}</span>
                    </p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => openExecute(item)}
                    disabled={String(item.status) !== "PENDING_REVIEW"}
                    className="bg-ts-success text-white hover:opacity-90"
                  >
                    Execute
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleReject(item)}
                    disabled={String(item.status) !== "PENDING_REVIEW"}
                    className="bg-ts-danger text-white hover:opacity-90"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {executeOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setExecuteOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-ts-border bg-ts-bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ts-text-main">
                Execute trade
              </h3>
              <Button
                type="button"
                onClick={() => setExecuteOpen(false)}
                className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
              >
                Close
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              <div>
                <label className="text-xs text-ts-text-muted">Executed price (USD)</label>
                <input
                  value={form.executed_price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, executed_price: event.target.value }))
                  }
                  className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-ts-text-muted">Executed amount (asset)</label>
                <input
                  value={form.executed_amount_asset}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, executed_amount_asset: event.target.value }))
                  }
                  className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-ts-text-muted">Profit / loss (USD)</label>
                <input
                  value={form.profit_or_loss_usd}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, profit_or_loss_usd: event.target.value }))
                  }
                  className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-ts-text-muted">Admin note</label>
                <textarea
                  value={form.admin_note}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, admin_note: event.target.value }))
                  }
                  className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={() => setExecuteOpen(false)}
                className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!selected.id) return;
                  await onExecute(selected.id, form);
                  setExecuteOpen(false);
                }}
                className="bg-ts-primary text-white hover:opacity-90"
              >
                Confirm execution
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
