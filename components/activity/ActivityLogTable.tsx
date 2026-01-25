"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import {
  archiveActivity,
  restoreActivity,
  deleteActivity,
  archiveAdminActivity,
  restoreAdminActivity,
  deleteAdminActivity,
} from "@/lib/activity";

type ActivityLogItem = {
  id?: number | string;
  action?: string;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  archived?: boolean;
  deleted?: boolean;
  user?: {
    id?: number | string;
    email?: string;
    username?: string;
    display_name?: string;
  };
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

const formatMeta = (meta?: Record<string, unknown> | null) => {
  if (!meta || typeof meta !== "object") return "--";
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
  return parts.length ? parts.join(" | ") : "--";
};

const getUserLabel = (user?: ActivityLogItem["user"]) => {
  if (!user) return "--";
  return user.display_name || user.username || user.email || "--";
};

const humanizeAction = (action?: string) => {
  if (!action) return "--";
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
    trade_requested: "Trade requested",
    trade_executed: "Trade executed",
    trade_rejected: "Trade rejected",
  };
  if (map[action]) return map[action];
  return action.replace(/_/g, " ");
};

export default function ActivityLogTable({
  items,
  title,
  showUser = false,
  emptyLabel,
  scope = "user",
  onRefresh,
  showArchivedByDefault = false,
  hideArchiveToggle = false,
}: {
  items: ActivityLogItem[];
  title: string;
  showUser?: boolean;
  emptyLabel: string;
  scope?: "user" | "admin";
  onRefresh?: () => void;
  showArchivedByDefault?: boolean;
  hideArchiveToggle?: boolean;
}) {
  const [showArchived, setShowArchived] = useState(showArchivedByDefault);
  const [localItems, setLocalItems] = useState<ActivityLogItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    setShowArchived(showArchivedByDefault);
  }, [showArchivedByDefault]);

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

  const updateItem = (id: string, updates: Partial<ActivityLogItem>) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        String(item.id) === id ? { ...item, ...updates } : item
      )
    );
  };

  const handleArchiveToggle = async (item: ActivityLogItem) => {
    if (!item.id) return;
    try {
      if (item.archived) {
        if (scope === "admin") {
          await restoreAdminActivity(item.id);
        } else {
          await restoreActivity(item.id);
        }
        updateItem(String(item.id), { archived: false });
      } else {
        if (scope === "admin") {
          await archiveAdminActivity(item.id);
        } else {
          await archiveActivity(item.id);
        }
        updateItem(String(item.id), { archived: true });
      }
      onRefresh?.();
    } catch {
      onRefresh?.();
    }
  };

  const handleDelete = async (item: ActivityLogItem) => {
    if (!item.id) return;
    const ok = window.confirm(
      "Delete this activity record? This action cannot be undone."
    );
    if (!ok) return;
    try {
      if (scope === "admin") {
        await deleteAdminActivity(item.id);
      } else {
        await deleteActivity(item.id);
      }
      updateItem(String(item.id), { deleted: true });
      onRefresh?.();
    } catch {
      onRefresh?.();
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ts-text-main">{title}</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {!hideArchiveToggle && (
            <button
              type="button"
              onClick={() => setShowArchived((prev) => !prev)}
              className="text-ts-text-muted hover:text-ts-text-main"
            >
              {showArchived ? "Hide archived" : "Show archived"}
            </button>
          )}
          <span className="text-ts-text-muted">
            {visibleItems.length} records
          </span>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">{emptyLabel}</p>
      ) : (
        <>
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
                <tr>
                  <th className="py-2 text-left font-medium">Date</th>
                {showUser && (
                  <th className="py-2 text-left font-medium">User</th>
                )}
                <th className="py-2 text-left font-medium">Action</th>
                <th className="py-2 text-left font-medium">Details</th>
                <th className="py-2 text-left font-medium">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ts-border">
              {visibleItems.map((item, index) => (
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
          <div className="mt-4 grid gap-3 md:hidden">
            {visibleItems.map((item, index) => (
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
                      {humanizeAction(item.action)}
                    </p>
                    {showUser && (
                      <p className="mt-1 text-xs text-ts-text-muted">
                        User:{" "}
                        <span className="text-ts-text-main">
                          {getUserLabel(item.user)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
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
                </div>
                <p className="mt-2 text-xs text-ts-text-muted">
                  {formatMeta(item.metadata)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
