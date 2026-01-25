"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import AdminDepositsTable from "@/components/admin/AdminDepositsTable";
import AdminWithdrawalsTable from "@/components/admin/AdminWithdrawalsTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import ActivityLogTable from "@/components/activity/ActivityLogTable";
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

export default function AdminDashboardPage() {
  const [deposits, setDeposits] = useState<AdminItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const loadAdminData = async () => {
    setLoading(true);
    setNotice(null);
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
    } catch (_e) {
      setNotice("Admin access required or data unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadAdminData();
    }
  }, [authLoading, isAdmin]);

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

  const handleAction = async (action: () => Promise<unknown>) => {
    setNotice(null);
    try {
      await action();
      await loadAdminData();
    } catch (_e) {
      const message =
        (typeof _e === "object" &&
          _e &&
          "response" in _e &&
          (_e as { response?: { data?: { detail?: string } } }).response
            ?.data?.detail) ||
        "Action failed. Please try again.";
      setNotice(message);
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
              onDisable={(id) => handleAction(() => disableUser(id))}
              onEnable={(id) => handleAction(() => enableUser(id))}
              onDelete={(id) => handleAction(() => deleteUser(id))}
            />
          )}

          {activeTab === "deposits" && (
            <AdminDepositsTable
              items={deposits}
              onConfirm={(id) => handleAction(() => confirmDeposit(id))}
              onReject={(id) => handleAction(() => rejectDeposit(id))}
            />
          )}

          {activeTab === "withdrawals" && (
            <AdminWithdrawalsTable
              items={withdrawals}
              onProcessing={(id) =>
                handleAction(() => markWithdrawalProcessing(id))
              }
              onPaid={(id) => handleAction(() => markWithdrawalPaid(id))}
              onReject={(id) => handleAction(() => rejectWithdrawal(id))}
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
