"use client";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import AssetIcon from "@/components/ui/AssetIcon";
import { formatAmount } from "@/lib/formatters";

type StatusItem = {
  id?: number | string;
  amount?: number | string;
  asset?: string;
  status?: string;
  created_at?: string;
};

type ActionConfig = {
  label: string;
  action: (id: number | string) => void;
  tone?: "default" | "danger";
  disabled?: (item: StatusItem) => boolean;
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const getPrice = (asset: string, prices?: Record<string, number>) => {
  if (!prices) return 0;
  if (asset.toUpperCase() === "USD") return 1;
  return prices[asset.toUpperCase()] || 0;
};

const formatUsd = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

export default function StatusTable({
  title,
  items,
  emptyLabel,
  actions = [],
  prices,
}: {
  title: string;
  items: StatusItem[];
  emptyLabel: string;
  actions?: ActionConfig[];
  prices?: Record<string, number>;
}) {
  const orderedItems = [...items].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ts-text-main">{title}</h2>
        <span className="text-xs text-ts-text-muted">{items.length} records</span>
      </div>

      {orderedItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">{emptyLabel}</p>
      ) : (
        <>
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
                <tr>
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-left font-medium">Amount</th>
                  <th className="py-2 text-left font-medium">Asset</th>
                  <th className="py-2 text-left font-medium">USD Value</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  {actions.length > 0 && (
                    <th className="py-2 text-left font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ts-border">
                {orderedItems.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                    <td className="py-3 pr-4">{formatAmount(item.amount)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <AssetIcon symbol={item.asset} size={20} />
                        <span className="sr-only">{item.asset || "--"}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {item.asset && prices
                        ? (() => {
                            const numeric =
                              typeof item.amount === "number"
                                ? item.amount
                                : Number(item.amount);
                            if (!Number.isFinite(numeric)) return "--";
                            const price = getPrice(item.asset, prices);
                            if (!price) return "--";
                            return formatUsd(numeric * price);
                          })()
                        : "--"}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge value={item.status} />
                    </td>
                    {actions.length > 0 && (
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          {actions.map((actionItem) => (
                            <Button
                              key={actionItem.label}
                              type="button"
                              onClick={() =>
                                item.id !== undefined &&
                                actionItem.action(item.id)
                              }
                              disabled={
                                item.id === undefined ||
                                (actionItem.disabled &&
                                  actionItem.disabled(item))
                              }
                              className={
                                actionItem.tone === "danger"
                                  ? "bg-ts-danger text-white hover:opacity-90"
                                  : "bg-ts-primary text-white hover:opacity-90"
                              }
                            >
                              {actionItem.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
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
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-ts-text-main">
                        {formatAmount(item.amount)}
                      </p>
                      <AssetIcon symbol={item.asset} size={18} />
                      <span className="sr-only">{item.asset || "--"}</span>
                    </div>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      USD Value:{" "}
                      <span className="text-ts-text-main">
                        {item.asset && prices
                          ? (() => {
                              const numeric =
                                typeof item.amount === "number"
                                  ? item.amount
                                  : Number(item.amount);
                              if (!Number.isFinite(numeric)) return "--";
                              const price = getPrice(item.asset, prices);
                              if (!price) return "--";
                              return formatUsd(numeric * price);
                            })()
                          : "--"}
                      </span>
                    </p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
                {actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {actions.map((actionItem) => (
                      <Button
                        key={actionItem.label}
                        type="button"
                        onClick={() =>
                          item.id !== undefined && actionItem.action(item.id)
                        }
                        disabled={
                          item.id === undefined ||
                          (actionItem.disabled && actionItem.disabled(item))
                        }
                        className={
                          actionItem.tone === "danger"
                            ? "bg-ts-danger text-white hover:opacity-90"
                            : "bg-ts-primary text-white hover:opacity-90"
                        }
                      >
                        {actionItem.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
