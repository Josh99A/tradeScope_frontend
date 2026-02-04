"use client";

import Link from "next/link";
import { Menu, User, Wallet, ArrowDownCircle, ArrowUpCircle, List } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import SymbolInfoCarousel from "../market/SymbolInfoCarousel";
import TickerTapeWidget from "../market/TickerTapeWidget";

export default function MobileDashboardHome({
  totalBalance,
  loadingBalance,
  onDeposit,
  onWithdraw,
}: {
  totalBalance?: string;
  loadingBalance?: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  const { user } = useAuth();

  const handleMenu = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ts-open-drawer"));
    }
  };

  const displayName =
    (user as any)?.display_name || user?.username || user?.email?.split("@")[0] || "Trader";

  return (
    <section className="md:hidden space-y-4 pb-24 pt-2">
      <div className="flex items-center justify-between rounded-xl border border-ts-border bg-ts-bg-card px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={handleMenu}
          className="h-9 w-9 rounded-full border border-ts-border bg-ts-bg-main"
        >
          <Menu size={18} />
        </Button>

        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-wide text-ts-text-main"
        >
          Trade<span className="text-ts-primary">Scope</span>
        </Link>

        <Link
          href="/settings"
          aria-label="Account settings"
          className="h-9 w-9 rounded-full border border-ts-border bg-ts-bg-main overflow-hidden flex items-center justify-center"
        >
          {user?.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photo_url}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={18} />
          )}
        </Link>
      </div>
      <TickerTapeWidget />

      <div className="rounded-xl border border-ts-border bg-ts-bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-full border border-ts-border bg-ts-bg-main overflow-hidden flex items-center justify-center">
            {user?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photo_url}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={22} />
            )}
          </div>
          <div>
            <p className="text-xs text-ts-text-muted">Welcome back</p>
            <p className="text-base font-semibold text-ts-text-main">
              {displayName}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-ts-border bg-ts-bg-card px-4 py-4">
        <p className="text-xs uppercase tracking-wide text-ts-text-muted">
          Main Wallet
        </p>
        <div className="mt-2 text-2xl font-semibold text-ts-text-main">
          {loadingBalance ? "--" : totalBalance || "--"}
        </div>
        <p className="mt-1 text-xs text-ts-text-muted">
          Total balance in USD
        </p>
      </div>

      <div className="rounded-2xl border border-ts-border bg-ts-bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-ts-text-muted">
          Shortcuts
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          <Link
            href="/settings"
            className="flex flex-col items-center gap-2 rounded-xl border border-ts-border bg-ts-bg-main p-3 text-xs text-ts-text-main hover:border-ts-primary/50"
          >
            <User size={18} />
            My Account
          </Link>
          <Link
            href="/dashboard/trade"
            className="flex flex-col items-center gap-2 rounded-xl border border-ts-border bg-ts-bg-main p-3 text-xs text-ts-text-main hover:border-ts-primary/50"
          >
            <List size={18} />
            Trade
          </Link>
          <button
            type="button"
            onClick={onDeposit}
            className="flex flex-col items-center gap-2 rounded-xl border border-ts-border bg-ts-bg-main p-3 text-xs text-ts-text-main hover:border-ts-primary/50"
            aria-label="Open deposit"
          >
            <ArrowDownCircle size={18} />
            Deposit
          </button>
          <button
            type="button"
            onClick={onWithdraw}
            className="flex flex-col items-center gap-2 rounded-xl border border-ts-border bg-ts-bg-main p-3 text-xs text-ts-text-main hover:border-ts-primary/50"
            aria-label="Open withdraw"
          >
            <ArrowUpCircle size={18} />
            Withdraw
          </button>
          <Link
            href="/history"
            className="flex flex-col items-center gap-2 rounded-xl border border-ts-border bg-ts-bg-main p-3 text-xs text-ts-text-main hover:border-ts-primary/50"
          >
            <Wallet size={18} />
            All Records
          </Link>
          <Link
            href="/history?type=deposit"
            className="flex flex-col items-center gap-2 rounded-xl border border-ts-border bg-ts-bg-main p-3 text-xs text-ts-text-main hover:border-ts-primary/50"
          >
            <Wallet size={18} />
            D-Records
          </Link>
          <Link
            href="/history?type=withdraw"
            className="flex flex-col items-center gap-2 rounded-xl border border-ts-border bg-ts-bg-main p-3 text-xs text-ts-text-main hover:border-ts-primary/50"
          >
            <Wallet size={18} />
            W-Records
          </Link>
        </div>
      </div>
    </section>
  );
}
