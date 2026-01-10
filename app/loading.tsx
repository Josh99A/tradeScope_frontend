"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ts-bg-main">
      <div className="flex flex-col items-center gap-4">
        
        {/* Spinner */}
        <Loader2
          className="h-10 w-10 animate-spin text-ts-primary"
        />

        {/* Branding */}
        <div className="text-center">
          <p className="text-sm font-medium text-ts-text-main">
            Loading TradeScope
          </p>
          <p className="text-xs text-ts-text-muted mt-1">
            Securing your trading experience
          </p>
        </div>

      </div>
    </div>
  );
}
