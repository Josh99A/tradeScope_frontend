"use client";

import Card from "@/components/ui/Card";

type ActivityItem = {
  id?: number | string;
  type?: string;
  amount?: number | string;
  status?: string;
  created_at?: string;
  description?: string;
  reference?: string;
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

export default function ActivityTable({
  items,
  title = "Activity log",
}: {
  items: ActivityItem[];
  title?: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ts-text-main">{title}</h2>
        <span className="text-xs text-ts-text-muted">
          {items.length} records
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">
          No activity yet.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
              <tr>
                <th className="py-2 text-left font-medium">Date</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-left font-medium">Amount</th>
                <th className="py-2 text-left font-medium">Status</th>
                <th className="py-2 text-left font-medium">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ts-border">
              {items.map((item, index) => (
                <tr key={item.id ?? index}>
                  <td className="py-3 pr-4">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="py-3 pr-4">
                    {item.type || item.description || "—"}
                  </td>
                  <td className="py-3 pr-4">
                    {formatAmount(item.amount)}
                  </td>
                  <td className="py-3 pr-4">
                    {item.status || "—"}
                  </td>
                  <td className="py-3">
                    {item.reference || "—"}
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
