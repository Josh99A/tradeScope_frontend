"use client";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

type AdminWithdrawal = {
  id?: number | string;
  amount?: number | string;
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

const getUserLabel = (user?: AdminWithdrawal["user"]) => {
  if (!user) return "—";
  return user.display_name || user.username || user.email || "—";
};

export default function AdminWithdrawalsTable({
  items,
  onProcessing,
  onPaid,
  onReject,
}: {
  items: AdminWithdrawal[];
  onProcessing: (id: number | string) => void;
  onPaid: (id: number | string) => void;
  onReject: (id: number | string) => void;
}) {
  const orderedItems = [...items].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ts-text-main">Withdrawals</h2>
        <span className="text-xs text-ts-text-muted">
          {items.length} records
        </span>
      </div>

      {orderedItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">No withdrawals found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
              <tr>
                <th className="py-2 text-left font-medium">Date</th>
                <th className="py-2 text-left font-medium">User</th>
                <th className="py-2 text-left font-medium">Amount</th>
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
                    <StatusBadge value={item.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => item.id && onProcessing(item.id)}
                        disabled={
                          !item.id ||
                          String(item.status).toLowerCase() !== "pending_review"
                        }
                        className="bg-ts-primary text-white hover:opacity-90"
                      >
                        Processing
                      </Button>
                      <Button
                        type="button"
                        onClick={() => item.id && onPaid(item.id)}
                        disabled={
                          !item.id ||
                          String(item.status).toLowerCase() === "paid"
                        }
                        className="bg-ts-success text-white hover:opacity-90"
                      >
                        Paid
                      </Button>
                      <Button
                        type="button"
                        onClick={() => item.id && onReject(item.id)}
                        disabled={
                          !item.id ||
                          String(item.status).toLowerCase() === "rejected"
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
      )}
    </Card>
  );
}
