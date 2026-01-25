"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import ActivityLogTable from "@/components/activity/ActivityLogTable";
import StatusTable from "@/components/wallet/StatusTable";
import { getDeposits, getWithdrawals } from "@/lib/wallet";
import { getActivity } from "@/lib/activity";

type ActivityLogItem = {
  id?: number | string;
  action?: string;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  archived?: boolean;
  deleted?: boolean;
};

type StatusItem = {
  id?: number | string;
  amount?: number | string;
  status?: string;
  created_at?: string;
};

const normalizeActivity = (data: unknown): ActivityLogItem[] => {
  if (Array.isArray(data)) return data as ActivityLogItem[];
  if (data && typeof data === "object") {
    const maybe = data as {
      results?: ActivityLogItem[];
      items?: ActivityLogItem[];
    };
    return maybe.results || maybe.items || [];
  }
  return [];
};

const normalizeStatus = (data: unknown): StatusItem[] => {
  if (Array.isArray(data)) return data as StatusItem[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: StatusItem[]; items?: StatusItem[] };
    return maybe.results || maybe.items || [];
  }
  return [];
};

export default function HistoryPage() {
  const [activity, setActivity] = useState<ActivityLogItem[]>([]);
  const [deposits, setDeposits] = useState<StatusItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<StatusItem[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [activityTab, setActivityTab] = useState<"all" | "archived">("all");
  const pendingWithdrawal = withdrawals.some((withdrawal) => {
    const status = String(withdrawal.status).toUpperCase();
    return (
      status === "PENDING" ||
      status === "PENDING_REVIEW" ||
      status === "PROCESSING"
    );
  });

  const loadActivity = async () => {
    setNotice(null);
    try {
      const [activityData, depositsData, withdrawalsData] =
        await Promise.all([
          getActivity({ includeArchived: true }),
          getDeposits(),
          getWithdrawals(),
        ]);
      setActivity(normalizeActivity(activityData));
      setDeposits(normalizeStatus(depositsData));
      setWithdrawals(normalizeStatus(withdrawalsData));
    } catch (_e) {
      setNotice("Unable to load activity history.");
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("ts_prices_cache");
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        if (parsed && typeof parsed === "object") {
          setPrices(parsed);
        }
      }
    } catch {
      // ignore cache read errors
    }
  }, []);

  return (
    <DashboardShell>
      <AppShell>
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-ts-text-main">
              History
            </h1>
            <p className="text-sm text-ts-text-muted">
              Review your recent account activity.
            </p>
          </div>

          {notice && (
            <div className="text-sm text-ts-text-muted">
              {notice}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All activity" },
              { id: "archived", label: "Archived" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActivityTab(tab.id as "all" | "archived")
                }
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  activityTab === tab.id
                    ? "border-ts-primary bg-ts-primary/10 text-ts-text-main"
                    : "border-ts-border bg-ts-bg-card text-ts-text-muted hover:border-ts-primary/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ActivityLogTable
            items={
              activityTab === "archived"
                ? activity.filter((item) => item.archived)
                : activity
            }
            title="Activity history"
            emptyLabel={
              activityTab === "archived"
                ? "No archived activity recorded."
                : "No activity recorded."
            }
            showArchivedByDefault={activityTab === "archived"}
            hideArchiveToggle={activityTab === "archived"}
            onRefresh={loadActivity}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div id="deposits" className="scroll-mt-20">
              <StatusTable
                title="Deposit history"
                items={deposits}
                emptyLabel="No deposits recorded."
                prices={prices}
              />
            </div>
            <div id="withdrawals" className="scroll-mt-20">
              <StatusTable
                title="Withdrawal history"
                items={withdrawals}
                emptyLabel="No withdrawals recorded."
                prices={prices}
              />
            </div>
          </div>
          {pendingWithdrawal && (
            <div className="rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-sm text-ts-text-main">
              Your withdrawal request is pending and will be processed
              within 24 hours.
            </div>
          )}
        </div>
      </AppShell>
    </DashboardShell>
  );
}
