"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  getActivity,
  getAdminActivity,
  archiveActivity,
  restoreActivity,
  deleteActivity,
  archiveAdminActivity,
  restoreAdminActivity,
  deleteAdminActivity,
} from "@/lib/activity";
import { getAdminPendingSummary } from "@/lib/admin";
import { cn } from "@/lib/utils";

type ActivityItem = {
  id?: number | string;
  action?: string;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  archived?: boolean;
  deleted?: boolean;
};

type NotificationItem = {
  id: string;
  sourceId?: number | string;
  title: string;
  detail?: string;
  createdAt?: string;
  archived?: boolean;
  deleted?: boolean;
  action?: string;
};

const isValidId = (value: unknown) => {
  if (value === null || value === undefined) return false;
  const text = String(value).trim().toLowerCase();
  if (!text || text === "undefined" || text === "null") return false;
  return true;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const normalizeList = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: T[]; items?: T[] };
    return maybe.results || maybe.items || [];
  }
  return [];
};

const humanizeAction = (action?: string) => {
  const map: Record<string, string> = {
    deposit_created: "Deposit requested",
    deposit_confirmed: "Deposit confirmed",
    deposit_approved: "Deposit confirmed",
    deposit_rejected: "Deposit rejected",
    withdrawal_requested: "Withdrawal requested",
    withdrawal_paid: "Withdrawal confirmed",
    withdrawal_rejected: "Withdrawal rejected",
    trade_requested: "Trade requested",
    trade_executed: "Trade executed",
    trade_rejected: "Trade rejected",
  };
  if (!action) return "Account update";
  return map[action] || action.replace(/_/g, " ");
};

const getNotificationLink = (action?: string, isAdmin?: boolean) => {
  if (isAdmin) {
    if (action === "deposit_created") return "/admin?tab=deposits";
    if (action === "withdrawal_requested") return "/admin?tab=withdrawals";
    if (action === "trade_requested") return "/admin/trades";
    return "/admin";
  }
  if (!action) return "/history";
  if (action.startsWith("deposit_")) return "/history#deposits";
  if (action.startsWith("withdrawal_")) return "/history#withdrawals";
  if (action.startsWith("trade_")) return "/dashboard/trade#my-requests";
  return "/history";
};

const formatMeta = (meta?: Record<string, unknown> | null) => {
  if (!meta || typeof meta !== "object") return "";
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
  return parts.join(" | ");
};

export default function NotificationsMenu({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [pendingTotal, setPendingTotal] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedRef = useRef(false);
  const lastIdsRef = useRef<Set<string>>(new Set());

  const unreadCount = items.filter(
    (item) => isValidId(item.sourceId) && !item.archived && !item.deleted
  ).length;

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const pendingCacheKey = "ts_admin_pending_summary";
        const pendingCacheTtlMs = 60_000;
        const readPendingCache = () => {
          try {
            const raw = window.localStorage.getItem(pendingCacheKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as { value: number; ts: number };
            if (!parsed || typeof parsed.ts !== "number") return null;
            if (Date.now() - parsed.ts > pendingCacheTtlMs) return null;
            return parsed.value ?? null;
          } catch {
            return null;
          }
        };
        const writePendingCache = (value: number) => {
          try {
            window.localStorage.setItem(
              pendingCacheKey,
              JSON.stringify({ value, ts: Date.now() })
            );
          } catch {
            // ignore cache write errors
          }
        };

        const cachedPending = readPendingCache();
        if (typeof cachedPending === "number") {
          setPendingTotal(cachedPending);
        } else {
          try {
            const pending = await getAdminPendingSummary();
            const nextTotal = Number(pending?.total_pending) || 0;
            setPendingTotal(nextTotal);
            writePendingCache(nextTotal);
          } catch {
            setPendingTotal(0);
          }
        }

        const data = await getAdminActivity({ includeArchived: true });
        const list = normalizeList<ActivityItem>(data);
        const relevant = list.filter((item) =>
          ["deposit_created", "withdrawal_requested", "trade_requested"].includes(
            String(item.action)
          )
        );
        const mapped = relevant
          .filter((item) => isValidId(item.id))
          .map((item) => ({
            id: String(item.id),
            sourceId: item.id,
            title: humanizeAction(item.action),
            detail: formatMeta(item.metadata),
            createdAt: item.created_at,
            archived: item.archived,
            deleted: item.deleted,
            action: item.action,
          }));
        mapped.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        if (hasLoadedRef.current) {
          const newItems = mapped.filter((entry) => !lastIdsRef.current.has(entry.id));
          newItems.slice(0, 3).forEach((entry) => {
            toast.success(`New admin notification: ${entry.title}`);
          });
        }
        lastIdsRef.current = new Set(mapped.map((entry) => entry.id));
        hasLoadedRef.current = true;
        setItems(mapped.slice(0, 8));
      } else {
        const data = await getActivity({ includeArchived: true });
        const list = normalizeList<ActivityItem>(data);
        const relevant = list.filter((item) =>
          [
            "deposit_confirmed",
            "deposit_approved",
            "deposit_rejected",
            "withdrawal_paid",
            "withdrawal_rejected",
            "trade_executed",
            "trade_rejected",
          ].includes(String(item.action))
        );
        const mapped = relevant
          .filter((item) => isValidId(item.id))
          .map((item) => ({
            id: String(item.id),
            sourceId: item.id,
            title: humanizeAction(item.action),
            detail: formatMeta(item.metadata),
            createdAt: item.created_at,
            archived: item.archived,
            deleted: item.deleted,
            action: item.action,
          }));
        mapped.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setItems(mapped.slice(0, 8));
      }
    } catch (_e) {
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [isAdmin]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const quickLink = useMemo(
    () => (isAdmin ? "/admin?tab=withdrawals" : "/history"),
    [isAdmin]
  );

  const visibleItems = items.filter((item) => {
    if (!isValidId(item.sourceId)) return false;
    if (item.deleted) return false;
    if (!showArchived && item.archived) return false;
    return true;
  });

  const handleArchiveToggle = async (item: NotificationItem) => {
    if (!isValidId(item.sourceId)) return;
    try {
      if (item.archived) {
        if (isAdmin) {
          await restoreAdminActivity(item.sourceId);
        } else {
          await restoreActivity(item.sourceId);
        }
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id ? { ...entry, archived: false } : entry
          )
        );
      } else {
        if (isAdmin) {
          await archiveAdminActivity(item.sourceId);
        } else {
          await archiveActivity(item.sourceId);
        }
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id ? { ...entry, archived: true } : entry
          )
        );
      }
    } catch (_e) {
      setError("Unable to update notification.");
    }
  };

  const handleDelete = async (item: NotificationItem) => {
    if (!isValidId(item.sourceId)) return;
    const ok = window.confirm(
      "Delete this notification? This action cannot be undone."
    );
    if (!ok) return;
    try {
      if (isAdmin) {
        await deleteAdminActivity(item.sourceId);
      } else {
        await deleteActivity(item.sourceId);
      }
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, deleted: true } : entry
        )
      );
    } catch (_e) {
      setError("Unable to delete notification.");
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        type="button"
        className={cn(
          "relative p-2 rounded-md hover:bg-ts-hover active:bg-ts-active transition",
          open && "bg-ts-hover"
        )}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-ts-danger px-1 text-[10px] font-semibold leading-5 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {isAdmin && pendingTotal > 0 && (
          <span className="absolute -bottom-1 -right-1 h-5 min-w-[20px] rounded-full bg-ts-warning px-1 text-[10px] font-semibold leading-5 text-ts-text-main">
            {pendingTotal > 99 ? "99+" : pendingTotal}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-[92vw] max-w-[22rem] rounded-xl border border-ts-border bg-ts-bg-card p-4 shadow-xl sm:w-80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ts-text-main">
              Notifications
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowArchived((prev) => !prev)}
                className="text-ts-text-muted hover:text-ts-text-main"
              >
                {showArchived ? "Hide archived" : "Show archived"}
              </button>
              <button
                type="button"
                onClick={() => loadNotifications()}
                className="text-ts-text-muted hover:text-ts-text-main"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {loading && (
              <p className="text-xs text-ts-text-muted">Loading...</p>
            )}
            {error && <p className="text-xs text-ts-danger">{error}</p>}
            {!loading && !error && visibleItems.length === 0 && (
              <p className="text-xs text-ts-text-muted">
                No notifications yet.
              </p>
            )}
            {!loading &&
              !error &&
              visibleItems.map((item) => (
                <div key={item.id} className="rounded-lg bg-ts-bg-main p-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={getNotificationLink(item.action, isAdmin)}
                      onClick={() => setOpen(false)}
                      className="flex-1"
                    >
                      <p className="text-xs font-medium text-ts-text-main">
                        {item.title}
                      </p>
                      {item.detail && (
                        <p className="mt-1 text-xs text-ts-text-muted">
                          {item.detail}
                        </p>
                      )}
                      {item.createdAt && (
                        <p className="mt-2 text-[11px] text-ts-text-muted">
                          {formatDate(item.createdAt)}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-ts-primary">
                        View details
                      </p>
                    </Link>
                    <div className="flex flex-col items-end gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleArchiveToggle(item)}
                        className="text-ts-text-muted hover:text-ts-text-main"
                        disabled={!isValidId(item.sourceId)}
                      >
                        {item.archived ? "Restore" : "Archive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="text-ts-danger hover:opacity-80"
                        disabled={!isValidId(item.sourceId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link
              href={quickLink}
              className="text-xs font-semibold text-ts-primary hover:underline"
            >
              {isAdmin ? "View admin requests" : "View history"}
            </Link>
            <span className="text-[11px] text-ts-text-muted">
              Showing latest 8
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
