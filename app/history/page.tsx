"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import ActivityTable from "@/components/wallet/ActivityTable";
import { getWalletActivity } from "@/lib/wallet";
import { useSearchParams } from "next/navigation";

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

const normalizeActivity = (data: unknown): ActivityItem[] => {
  if (Array.isArray(data)) return data as ActivityItem[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: ActivityItem[]; items?: ActivityItem[] };
    return maybe.results || maybe.items || [];
  }
  return [];
};

export default function HistoryPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const filterType = searchParams.get("type");

  const loadActivity = async () => {
    setNotice(null);
    try {
      const activityData = await getWalletActivity({
        includeArchived: true,
        forceRefresh: true,
      });
      setActivity(normalizeActivity(activityData));
    } catch (_e) {
      setNotice("Unable to load activity log.");
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const filteredActivity = useMemo(() => {
    if (!filterType) return activity;
    const normalized = filterType.toLowerCase();
    return activity.filter((item) => {
      const text = `${item.type || ""} ${item.description || ""}`.toLowerCase();
      if (normalized === "deposit") return text.includes("deposit");
      if (normalized === "withdraw") return text.includes("withdraw");
      return true;
    });
  }, [activity, filterType]);

  return (
    <DashboardShell>
      <AppShell>
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-ts-text-main">
              Activity logs
            </h1>
            <p className="text-sm text-ts-text-muted">
              Review your recent wallet activity.
            </p>
          </div>

          {notice && (
            <div className="text-sm text-ts-text-muted">
              {notice}
            </div>
          )}

          <ActivityTable
            items={filteredActivity}
            title="Wallet activity"
            onRefresh={loadActivity}
          />
        </div>
      </AppShell>
    </DashboardShell>
  );
}
