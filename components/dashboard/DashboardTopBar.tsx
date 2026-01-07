"use client";

import { Menu, Bell, Sun, Moon } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const  DashboardTopBar = ({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) => {
  

  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-ts-bg-card border-b border-ts-border z-50">
  <div className="h-full flex items-center justify-between px-4">
    
    {/* Left */}
    <div className="flex items-center gap-3">
      <button
        className="md:hidden p-2 rounded-md hover:bg-ts-hover active:bg-ts-active transition"
        aria-label="Open menu"
      onClick={onMenuClick}
      >
        <Menu size={20} />
      </button>

      <h1 className="font-medium text-sm">Dashboard</h1>
    </div>

    {/* Right */}
    <div className="flex items-center gap-2">
      <ThemeToggle/>

      <button
        className="relative p-2 rounded-md hover:bg-ts-hover active:bg-ts-active transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute top-1 right-1 h-2 w-2 bg-ts-danger rounded-full" />
      </button>

      <button className="p-1 rounded-full hover:bg-ts-hover transition">
        <img
          src="/avatar.png"
          className="w-8 h-8 rounded-full"
          alt="User avatar"
        />
      </button>
    </div>
  </div>
</header>

  );
}

export default DashboardTopBar;