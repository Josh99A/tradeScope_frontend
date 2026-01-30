"use client";

import MarketTable from "@/components/dashboard/MarketTable";
import LiveMarketGrid from "@/components/market/LiveMarketGrid";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";

const MarketsPage = () => {
  return (
    <DashboardShell>
      <AppShell>
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-ts-text-main">Markets</h1>
            <p className="text-sm text-ts-text-muted">
              Live crypto prices and 24h change.
            </p>
          </div>

          <LiveMarketGrid limit={6} />

          <MarketTable />
        </div>
      </AppShell>
    </DashboardShell>
  );
};

export default MarketsPage;
