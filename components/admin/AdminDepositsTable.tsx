"use client";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import AssetIcon from "@/components/ui/AssetIcon";
import { formatAmount } from "@/lib/formatters";

type AdminDeposit = {
  id?: number | string;
  amount?: number | string;
  asset?: string;
  status?: string;
  created_at?: string;
  user?: {
    id?: number | string;
    email?: string;
    username?: string;
    display_name?: string;
  };
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const getUserLabel = (user?: AdminDeposit["user"]) => {
  if (!user) return "--";
  return user.display_name || user.username || user.email || "--";
};

export default function AdminDepositsTable({
  items,
  onConfirm,
  onReject,
}: {
  items: AdminDeposit[];
  onConfirm: (id: number | string) => void;
  onReject: (id: number | string) => void;
}) {
  const orderedItems = [...items].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ts-text-main">Deposits</h2>
        <span className="text-xs text-ts-text-muted">{items.length} records</span>
      </div>

      {orderedItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">No deposits found.</p>
      ) : (
        <>
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
                <tr>
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-left font-medium">User</th>
                  <th className="py-2 text-left font-medium">Amount</th>
                  <th className="py-2 text-left font-medium">Asset</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ts-border">
                {orderedItems.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                    <td className="py-3 pr-4">{getUserLabel(item.user)}</td>
                    <td className="py-3 pr-4">{formatAmount(item.amount)}</td>
                    <td className="py-3 pr-4">
                      <AssetIcon symbol={item.asset} size={24} />
                      <span className="sr-only">{item.asset || "--"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => item.id && onConfirm(item.id)}
                          disabled={
                            !item.id ||
                            String(item.status).toLowerCase() !== "pending_review"
                          }
                          className="bg-ts-success text-white hover:opacity-90"
                        >
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          onClick={() => item.id && onReject(item.id)}
                          disabled={
                            !item.id ||
                            String(item.status).toLowerCase() !== "pending_review"
                          }
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
                      <span className="inline-flex items-center gap-2">
                        {formatAmount(item.amount)}
                        <AssetIcon symbol={item.asset} size={18} />
                      </span>
                      <span className="sr-only">{item.asset || "--"}</span>
                    </p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => item.id && onConfirm(item.id)}
                    disabled={
                      !item.id ||
                      String(item.status).toLowerCase() !== "pending_review"
                    }
                    className="bg-ts-success text-white hover:opacity-90"
                  >
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    onClick={() => item.id && onReject(item.id)}
                    disabled={
                      !item.id ||
                      String(item.status).toLowerCase() !== "pending_review"
                    }
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
    </Card>
  );
}
