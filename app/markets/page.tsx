"use client";

import MarketTable from "@/components/dashboard/MarketTable";
import LiveMarketGrid from "@/components/market/LiveMarketGrid";
import TopNav from "@/components/navigation/TopNav";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/auth/AuthProvider";

const MarketsPage = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <TopNav isAuthenticated={isAuthenticated} user={user || undefined} />
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-ts-text-main">Markets</h1>
          <p className="text-sm text-ts-text-muted">
            Live crypto prices and 24h change.
          </p>
        </div>

        <LiveMarketGrid limit={6} />

        <MarketTable />
      </main>
      <Footer />
    </>
  );
};

export default MarketsPage;
