"use client";

import { useState } from "react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import MobileDrawer from "@/components/dashboard/MobileDrawer";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ts-bg-main">
      <DashboardTopBar onMenuClick={() => setDrawerOpen(true)} />

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="pt-16 pb-20 md:pb-6 px-4">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
