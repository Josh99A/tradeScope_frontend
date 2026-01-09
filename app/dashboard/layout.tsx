"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import MobileDrawer from "@/components/dashboard/MobileDrawer";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated]);

  if (loading) return null;

  

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

export default DashboardLayout
