"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideTopBarOnMobile = pathname === "/dashboard";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const query = searchParams.toString();
      const next = `${pathname}${query ? `?${query}` : ""}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [loading, isAuthenticated, router, pathname, searchParams]);

  useEffect(() => {
    const handleOpenDrawer = () => setDrawerOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("ts-open-drawer", handleOpenDrawer);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ts-open-drawer", handleOpenDrawer);
      }
    };
  }, []);

  if (loading) return null;

  

  return (
    <div className="min-h-screen bg-ts-bg-main">
      <div className={hideTopBarOnMobile ? "hidden md:block" : undefined}>
        <DashboardTopBar onMenuClick={() => setDrawerOpen(true)} />
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="pt-3 pb-20 md:pt-10 md:pb-6 px-4 md:px-6">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}

export default DashboardLayout
