"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import AdminDepositsTable from "@/components/admin/AdminDepositsTable";
import AdminWithdrawalsTable from "@/components/admin/AdminWithdrawalsTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import ActivityLogTable from "@/components/activity/ActivityLogTable";
import toast from "react-hot-toast";
import {
  getAdminDeposits,
  getAdminWithdrawals,
  getAdminUsers,
  confirmDeposit,
  rejectDeposit,
  markWithdrawalProcessing,
  markWithdrawalPaid,
  rejectWithdrawal,
  disableUser,
  enableUser,
  deleteUser,
} from "@/lib/admin";
import { getAdminActivity } from "@/lib/activity";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";

type AdminItem = {
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

type AdminUser = {
  id?: number | string;
  email?: string;
  username?: string;
  display_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  deleted_at?: string | null;
  date_joined?: string;
  last_login?: string | null;
  last_login_at?: string | null;
};

type AdminActivityItem = {
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

const normalizeList = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: T[]; items?: T[] };
    return maybe.results || maybe.items || [];
  }
  return [];
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


const confirmAdminAction = (message: string) => {
  if (typeof window === "undefined") return false;
  return window.confirm(message);
};

export default function AdminDashboardPage() {
  const [deposits, setDeposits] = useState<AdminItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionState, setActionState] = useState<{
    id: number | string | null;
    action: string | null;
  }>({ id: null, action: null });
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "users" | "deposits" | "withdrawals" | "activity"
  >("users");

  const isAdmin = !!(user?.is_staff || user?.is_superuser);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      ["users", "deposits", "withdrawals", "activity"].includes(tab)
    ) {
      setActiveTab(tab as "users" | "deposits" | "withdrawals" | "activity");
    }
  }, [searchParams]);

  const loadAdminData = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
      setNotice(null);
    }
    try {
      const [depositData, withdrawalData, userData, activityData] =
        await Promise.all([
          getAdminDeposits(),
          getAdminWithdrawals(),
          getAdminUsers(),
          getAdminActivity({ includeArchived: true }),
        ]);
      setDeposits(normalizeList<AdminItem>(depositData));
      setWithdrawals(normalizeList<AdminItem>(withdrawalData));
      setUsers(normalizeList<AdminUser>(userData));
      setActivity(normalizeList<AdminActivityItem>(activityData));
    } catch (error) {
      if (!options?.silent) {
        const message = getErrorMessage(error, "Admin access required or data unavailable.");
        setNotice(message);
        toast.error(message);
      }
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadAdminData();
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (!authLoading && isAdmin && activeTab === "users") {
      const intervalId = setInterval(() => {
        loadAdminData({ silent: true });
      }, 60000);
      return () => clearInterval(intervalId);
    }
  }, [authLoading, isAdmin, activeTab]);

  if (authLoading) return null;
  if (!isAdmin) {
    return (
      <DashboardShell>
        <AppShell>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-ts-text-main">
              Admin dashboard
            </h1>
            <p className="text-sm text-ts-text-muted">
              You do not have access to this page.
            </p>
          </div>
        </AppShell>
      </DashboardShell>
    );
  }

  const handleAction = async (
    id: number | string,
    actionKey: string,
    action: () => Promise<unknown>,
    confirmMessage: string
  ) => {
    setNotice(null);
    try {
      if (actionState.action) return;
      if (confirmMessage && !confirmAdminAction(confirmMessage)) {
        return;
      }
      setActionState({ id, action: actionKey });
      await action();
      await loadAdminData();
      toast.success("Action completed successfully.");
    } catch (error) {
      const message = getErrorMessage(error, "Action failed. Please try again.");
      setNotice(message);
      toast.error(message);
    } finally {
      setActionState({ id: null, action: null });
    }
  };

  return (
    <DashboardShell>
      <AppShell>
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-ts-text-main">
              Admin dashboard
            </h1>
            <p className="text-sm text-ts-text-muted">
              Manage deposits and withdrawals. Admin access required.
            </p>
          </div>

          {notice && <div className="text-sm text-ts-text-muted">{notice}</div>}

          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
            {[
              { id: "users", label: "Users" },
              { id: "deposits", label: "Deposits" },
              { id: "withdrawals", label: "Withdrawals" },
              { id: "activity", label: "Activity" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  const value = tab.id as
                    | "users"
                    | "deposits"
                    | "withdrawals"
                    | "activity";
                  setActiveTab(value);
                  router.replace(`/admin?tab=${value}`);
                }}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                  activeTab === tab.id
                    ? "border-ts-primary bg-ts-primary/10 text-ts-text-main"
                    : "border-ts-border bg-ts-bg-card text-ts-text-muted hover:border-ts-primary/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "users" && (
            <AdminUsersTable
              items={users}
              onDisable={(id) =>
                handleAction(
                  id,
                  "user-disable",
                  () => disableUser(id),
                  "Disable this user? They will not be able to sign in."
                )
              }
              onEnable={(id) =>
                handleAction(
                  id,
                  "user-enable",
                  () => enableUser(id),
                  "Enable this user account?"
                )
              }
              onDelete={(id) =>
                handleAction(
                  id,
                  "user-delete",
                  () => deleteUser(id),
                  "Delete this user permanently? This cannot be undone."
                )
              }
            />
          )}

          {activeTab === "deposits" && (
            <AdminDepositsTable
              items={deposits}
              onConfirm={(id) =>
                handleAction(
                  id,
                  "deposit-confirm",
                  () => confirmDeposit(id),
                  "Confirm this deposit request?"
                )
              }
              onReject={(id) =>
                handleAction(
                  id,
                  "deposit-reject",
                  () => rejectDeposit(id),
                  "Reject this deposit request?"
                )
              }
              busyId={
                actionState.action?.startsWith("deposit-") ? actionState.id : null
              }
              busyAction={
                actionState.action === "deposit-confirm"
                  ? "confirm"
                  : actionState.action === "deposit-reject"
                  ? "reject"
                  : null
              }
              disableActions={Boolean(actionState.action)}
            />
          )}

          {activeTab === "withdrawals" && (
            <AdminWithdrawalsTable
              items={withdrawals}
              onProcessing={(id) =>
                handleAction(
                  id,
                  "withdrawal-processing",
                  () => markWithdrawalProcessing(id),
                  "Mark this withdrawal as processing?"
                )
              }
              onPaid={(id) =>
                handleAction(
                  id,
                  "withdrawal-paid",
                  () => markWithdrawalPaid(id),
                  "Mark this withdrawal as paid? This will finalize it."
                )
              }
              onReject={(id) =>
                handleAction(
                  id,
                  "withdrawal-reject",
                  () => rejectWithdrawal(id),
                  "Reject this withdrawal request?"
                )
              }
              busyId={
                actionState.action?.startsWith("withdrawal-")
                  ? actionState.id
                  : null
              }
              busyAction={
                actionState.action === "withdrawal-processing"
                  ? "processing"
                  : actionState.action === "withdrawal-paid"
                  ? "paid"
                  : actionState.action === "withdrawal-reject"
                  ? "reject"
                  : null
              }
              disableActions={Boolean(actionState.action)}
            />
          )}

          {activeTab === "activity" && (
            <ActivityLogTable
              items={activity}
              title="Admin activity"
              showUser
              emptyLabel={
                loading ? "Loading activity..." : "No activity found."
              }
              scope="admin"
              onRefresh={loadAdminData}
            />
          )}
        </div>
      </AppShell>
    </DashboardShell>
  );
}
