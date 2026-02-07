"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import AdminTradeRequestsTable from "@/components/admin/AdminTradeRequestsTable";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import {
  getAdminTradeRequests,
  executeTradeRequest,
  rejectTradeRequest,
} from "@/lib/trades";

type TradeRequestItem = {
  id?: number | string;
  record_id?: string;
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

const normalizeList = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: T[]; items?: T[] };
    return maybe.results || maybe.items || [];
  }
  return [];
};

const getResponseRecordId = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const recordId = (payload as { record_id?: unknown }).record_id;
  if (typeof recordId === "string" && recordId.trim()) return recordId.trim();
  const fallbackId = (payload as { id?: unknown }).id;
  if (
    typeof fallbackId === "string" ||
    typeof fallbackId === "number"
  ) {
    return String(fallbackId);
  }
  return null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") return fallback;
  if (
    "response" in error &&
    (error as { response?: { data?: any } }).response?.data
  ) {
    const data = (error as { response?: { data?: any } }).response?.data;
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;
    if (typeof data === "object") {
      const first = Object.values(data)[0];
      if (Array.isArray(first)) return String(first[0]);
      if (typeof first === "string") return first;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export default function AdminTradesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = !!(user?.is_staff || user?.is_superuser);

  const [items, setItems] = useState<TradeRequestItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionState, setActionState] = useState<{
    id: number | string | null;
    action: "execute" | "reject" | null;
  }>({ id: null, action: null });
  const [filters, setFilters] = useState({
    status: "",
    symbol: "",
    side: "",
    user: "",
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  const loadRequests = async () => {
    setNotice(null);
    try {
      const data = await getAdminTradeRequests(filters);
      setItems(normalizeList<TradeRequestItem>(data));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load trade requests.");
      setNotice(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadRequests();
    }
  }, [authLoading, isAdmin, filters]);

  const handleExecute = async (
    id: number | string,
    payload: {
      executed_price: string;
      executed_amount_asset: string;
      profit_or_loss_usd: string;
      admin_note?: string;
    }
  ) => {
    setNotice(null);
    try {
      if (actionState.action) return;
      setActionState({ id, action: "execute" });
      const response = await executeTradeRequest(id, payload);
      await loadRequests();
      const recordId = getResponseRecordId(response) || String(id);
      toast.success(`Trade request executed (${recordId}).`);
    } catch (error) {
      const message = getErrorMessage(error, "Action failed. Please try again.");
      setNotice(message);
      toast.error(message);
    } finally {
      setActionState({ id: null, action: null });
    }
  };

  const handleReject = async (id: number | string, reason: string) => {
    setNotice(null);
    try {
      if (actionState.action) return;
      setActionState({ id, action: "reject" });
      const response = await rejectTradeRequest(id, reason);
      await loadRequests();
      const recordId = getResponseRecordId(response) || String(id);
      toast.success(`Trade request rejected (${recordId}).`);
    } catch (error) {
      const message = getErrorMessage(error, "Action failed. Please try again.");
      setNotice(message);
      toast.error(message);
    } finally {
      setActionState({ id: null, action: null });
    }
  };

  if (authLoading) return null;
  if (!isAdmin) return null;

  return (
    <DashboardShell>
      <AppShell>
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-ts-text-main">
              Trade requests
            </h1>
            <p className="text-sm text-ts-text-muted">
              Review and execute user trade requests.
            </p>
          </div>

          {notice && <div className="text-sm text-ts-text-muted">{notice}</div>}

          <div className="grid gap-2 sm:grid-cols-4">
            <input
              value={filters.symbol}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, symbol: event.target.value }))
              }
              placeholder="Symbol"
              className="w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
            />
            <select
              value={filters.side}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, side: event.target.value }))
              }
              className="w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
            >
              <option value="">All sides</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value }))
              }
              className="w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="PENDING_REVIEW">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXECUTED">Executed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              value={filters.user}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, user: event.target.value }))
              }
              placeholder="User ID"
              className="w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
            />
          </div>

          <AdminTradeRequestsTable
            items={items}
            onExecute={handleExecute}
            onReject={handleReject}
            busyId={actionState.id}
            busyAction={actionState.action}
            disableActions={Boolean(actionState.action)}
          />
        </div>
      </AppShell>
    </DashboardShell>
  );
}
