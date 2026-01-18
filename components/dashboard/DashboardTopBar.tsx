"use client";

import Link from "next/link";
import { Menu, Bell } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { Button } from "../ui/Button";
import LogoutButton from "../ui/LogoutButton";
import { useAuth } from "@/components/auth/AuthProvider";

const  DashboardTopBar = ({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) => {
  const { user } = useAuth();
  

  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-ts-bg-card border-b border-ts-border z-50">
  <div className="h-full flex items-center justify-between px-4">
    
    {/* Left */}
    <div className="flex items-center gap-3">
      <Button
        className="md:hidden p-2 rounded-md hover:bg-ts-hover active:bg-ts-active transition"
        aria-label="Open menu"
      onClick={onMenuClick}
      >
        <Menu size={20} />
      </Button>

      <h1 className="font-medium text-sm">Dashboard</h1>
    </div>

    {/* Right */}
    <div className="flex items-center gap-2">
      {user && (
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-xs text-ts-text-muted">Welcome back</span>
          <span className="text-sm font-medium">
            {user.username || user.email?.split("@")[0]}
          </span>
        </div>
      )}
      

      <Button
        className="relative p-2 rounded-md hover:bg-ts-hover active:bg-ts-active transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute top-1 right-1 h-2 w-2 bg-ts-danger rounded-full" />
      </Button>
      <LogoutButton/>

      <Link
        href="/settings"
        className="p-1 rounded-full hover:bg-ts-hover transition"
      >
        <img
          src={user?.photo_url || "/Images/avatar-placeholder.jpg"}
          className="w-8 h-8 rounded-full"
          alt={user?.username || "User avatar"}
        />
      </Link>
      <ThemeToggle/>
    </div>
  </div>
</header>

  );
}

export default DashboardTopBar;
