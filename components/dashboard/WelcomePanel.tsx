"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function WelcomePanel() {
  const { user, loading } = useAuth();

  if (loading) return null;

  const displayName =
    user?.username || user?.email?.split("@")[0] || "Trader";
  const photoUrl = user?.photo_url || "/Images/avatar-placeholder.jpg";

  return (
    <div className="rounded-xl border border-ts-border bg-ts-bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full border border-ts-border overflow-hidden bg-ts-bg-main">
            <img
              src={photoUrl}
              alt={user?.username || "Profile photo"}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ts-text-muted">
              Welcome back
            </p>
            <h2 className="text-lg font-semibold text-ts-text-main">
              {displayName}
            </h2>
            <p className="text-xs text-ts-text-muted">
              Your portfolio is ready to explore.
            </p>
          </div>
        </div>
        <div className="text-xs text-ts-text-muted">
          Tip: Check the market snapshot for the latest movers.
        </div>
      </div>
    </div>
  );
}
