"use client";

import Card from "@/components/ui/Card";

type ActivityLogItem = {
  id?: number | string;
  action?: string;
  metadata?: Record<string, unknown> | null;
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

const formatMeta = (meta?: Record<string, unknown> | null) => {
  if (!meta || typeof meta !== "object") return "—";
  const parts: string[] = [];
  Object.entries(meta).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    const label = key.replace(/_/g, " ");
    const text =
      typeof value === "string" || typeof value === "number"
        ? String(value)
        : JSON.stringify(value);
    parts.push(`${label}: ${text}`);
  });
  return parts.length ? parts.join(" • ") : "—";
};

const getUserLabel = (user?: ActivityLogItem["user"]) => {
  if (!user) return "—";
  return user.display_name || user.username || user.email || "—";
};

const humanizeAction = (action?: string) => {
  if (!action) return "—";
  const map: Record<string, string> = {
    deposit_created: "Deposit requested",
    deposit_confirmed: "Deposit confirmed",
    deposit_approved: "Deposit approved",
    deposit_rejected: "Deposit rejected",
    withdrawal_requested: "Withdrawal requested",
    withdrawal_paid: "Withdrawal paid",
    withdrawal_rejected: "Withdrawal rejected",
    profile_updated: "Profile updated",
    user_disabled: "Account disabled",
    user_enabled: "Account enabled",
    user_deleted: "Account removed",
  };
  if (map[action]) return map[action];
  return action.replace(/_/g, " ");
};

export default function ActivityLogTable({
  items,
  title,
  showUser = false,
  emptyLabel,
}: {
  items: ActivityLogItem[];
  title: string;
  showUser?: boolean;
  emptyLabel: string;
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
                {showUser && (
                  <th className="py-2 text-left font-medium">User</th>
                )}
                <th className="py-2 text-left font-medium">Action</th>
                <th className="py-2 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ts-border">
              {orderedItems.map((item, index) => (
                <tr key={item.id ?? index}>
                  <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                  {showUser && (
                    <td className="py-3 pr-4">{getUserLabel(item.user)}</td>
                  )}
                  <td className="py-3 pr-4">
                    {humanizeAction(item.action)}
                  </td>
                  <td className="py-3 text-ts-text-muted">
                    {formatMeta(item.metadata)}
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
