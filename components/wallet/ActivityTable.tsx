"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import {
  archiveWalletActivity,
  restoreWalletActivity,
  deleteWalletActivity,
} from "@/lib/wallet";

type ActivityItem = {
  id?: number | string;
  type?: string;
  amount?: number | string;
  status?: string;
  created_at?: string;
  description?: string;
  reference?: string;
  archived?: boolean;
  deleted?: boolean;
};

const isValidId = (value: unknown) => {
  if (value === null || value === undefined) return false;
  const text = String(value).trim().toLowerCase();
  if (!text || text === "undefined" || text === "null") return false;
  return true;
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatAmount = (value?: number | string) => {
  if (value === null || value === undefined || value === "") return "--";
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toLocaleString();
};

export default function ActivityTable({
  items,
  title = "Activity log",
  onRefresh,
}: {
  items: ActivityItem[];
  title?: string;
  onRefresh?: () => void;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const [localItems, setLocalItems] = useState<ActivityItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const orderedItems = useMemo(() => {
    return [...localItems].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [localItems]);

  const visibleItems = orderedItems.filter((item) => {
    if (!isValidId(item.id)) return false;
    if (item.deleted) return false;
    if (!showArchived && item.archived) return false;
    return true;
  });

  const updateItem = (id: string, updates: Partial<ActivityItem>) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        String(item.id) === id ? { ...item, ...updates } : item
      )
    );
  };

  const handleArchiveToggle = async (item: ActivityItem) => {
    if (!item.id) return;
    try {
      if (item.archived) {
        await restoreWalletActivity(item.id);
        updateItem(String(item.id), { archived: false });
      } else {
        await archiveWalletActivity(item.id);
        updateItem(String(item.id), { archived: true });
      }
      onRefresh?.();
    } catch {
      onRefresh?.();
    }
  };

  const handleDelete = async (item: ActivityItem) => {
    if (!item.id) return;
    const ok = window.confirm(
      "Delete this activity record? This action cannot be undone."
    );
    if (!ok) return;
    try {
      await deleteWalletActivity(item.id);
      updateItem(String(item.id), { deleted: true });
      onRefresh?.();
    } catch {
      onRefresh?.();
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ts-text-main">{title}</h2>
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setShowArchived((prev) => !prev)}
            className="text-ts-text-muted hover:text-ts-text-main"
          >
            {showArchived ? "Hide archived" : "Show archived"}
          </button>
          <span className="text-ts-text-muted">
            {visibleItems.length} records
          </span>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">No activity yet.</p>
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
                <th className="py-2 text-left font-medium">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ts-border">
              {visibleItems.map((item, index) => (
                <tr key={item.id ?? index}>
                  <td className="py-3 pr-4">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="py-3 pr-4">
                    {item.type || item.description || "--"}
                  </td>
                  <td className="py-3 pr-4">
                    {formatAmount(item.amount)}
                  </td>
                  <td className="py-3 pr-4">{item.status || "--"}</td>
                  <td className="py-3">{item.reference || "--"}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleArchiveToggle(item)}
                        className="text-ts-text-muted hover:text-ts-text-main"
                        disabled={!isValidId(item.id)}
                      >
                        {item.archived ? "Restore" : "Archive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="text-ts-danger hover:opacity-80"
                        disabled={!isValidId(item.id)}
                      >
                        Delete
                      </button>
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
