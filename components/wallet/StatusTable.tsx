"use client";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

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
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatAmount = (value?: number | string) => {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toLocaleString();
};

export default function StatusTable({
  title,
  items,
  emptyLabel,
  actions = [],
}: {
  title: string;
  items: StatusItem[];
  emptyLabel: string;
  actions?: ActionConfig[];
}) {
  const orderedItems = [...items].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ts-text-main">{title}</h2>
        <span className="text-xs text-ts-text-muted">
          {items.length} records
        </span>
      </div>

      {orderedItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
              <tr>
                <th className="py-2 text-left font-medium">Date</th>
                <th className="py-2 text-left font-medium">Amount</th>
                <th className="py-2 text-left font-medium">Asset</th>
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
                  <td className="py-3 pr-4">{item.asset || "—"}</td>
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
      )}
    </Card>
  );
}
