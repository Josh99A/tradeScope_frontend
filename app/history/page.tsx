"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import ActivityTable from "@/components/wallet/ActivityTable";
import { getWalletActivity } from "@/lib/wallet";

type ActivityItem = {
  id?: number | string;
  type?: string;
  amount?: number | string;
  status?: string;
  created_at?: string;
  description?: string;
  reference?: string;
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

  useEffect(() => {
    const loadActivity = async () => {
      setNotice(null);
      try {
        const data = await getWalletActivity();
        setActivity(normalizeActivity(data));
      } catch (_e) {
        setNotice("Unable to load activity history.");
      }
    };

    loadActivity();
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
              Review your recent wallet activity.
            </p>
          </div>

          {notice && (
            <div className="text-sm text-ts-text-muted">
              {notice}
            </div>
          )}

          <ActivityTable items={activity} title="Activity history" />
        </div>
      </AppShell>
    </DashboardShell>
  );
}
