"use client";

import SideNav from "../navigation/SideNav";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-ts-bg-main text-ts-text-main">
      <SideNav />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
