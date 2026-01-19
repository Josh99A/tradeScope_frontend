"use client";

import { useEffect, useState } from "react";
import ActivityLogTable from "@/components/activity/ActivityLogTable";
import { getActivity } from "@/lib/activity";

type ActivityLogItem = {
  id?: number | string;
  action?: string;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
};

const normalizeList = (data: unknown): ActivityLogItem[] => {
  if (Array.isArray(data)) return data as ActivityLogItem[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: ActivityLogItem[]; items?: ActivityLogItem[] };
    return maybe.results || maybe.items || [];
  }
  return [];
};

export default function RecentActivity() {
  const [items, setItems] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActivity();
        const list = normalizeList(data).sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA;
        });
        setItems(list.slice(0, 5));
      } catch {
        setItems([]);
      }
    };
    load();
  }, []);

  return (
    <ActivityLogTable
      items={items}
      title="Recent activity"
      emptyLabel="No recent activity."
    />
  );
}
