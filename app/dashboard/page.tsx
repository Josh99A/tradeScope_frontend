import React from "react";
import AppShell from "@/components/layout/AppShell";
import WalletSummary from "@/components/dashboard/WalletSummary";
import MarketTable from "@/components/dashboard/MarketTable";
import QuickTradePanel from "@/components/dashboard/QuickTradePanel";
import WelcomePanel from "@/components/dashboard/WelcomePanel";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LiveMarketList from "@/components/market/LiveMarketList";
import LiveMarketGrid from "@/components/market/LiveMarketGrid";
import LiveTickerTable from "@/components/market/LiveTickerTable";

const Dashboard = () => {
  return (
    <AppShell>
      <div className="space-y-4">
        <WelcomePanel />
        <WalletSummary />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <LiveTickerTable limit={8} />
            <LiveMarketGrid limit={6} />
            <MarketTable />
          </div>

          <div className="space-y-4">
            <QuickTradePanel />
            <LiveMarketList limit={5} />
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default Dashboard
