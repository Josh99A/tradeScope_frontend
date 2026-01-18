"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ActivityTable from "@/components/wallet/ActivityTable";
import {
  getWallet,
  depositFunds,
  withdrawFunds,
  getWalletActivity,
} from "@/lib/wallet";

type WalletData = {
  balance?: number | string;
  total_balance?: number | string;
  available_balance?: number | string;
  available?: number | string;
  pending_withdrawals?: number | string;
  pending?: number | string;
  currency?: string;
};

type ActivityItem = {
  id?: number | string;
  type?: string;
  amount?: number | string;
  status?: string;
  created_at?: string;
  description?: string;
  reference?: string;
};

const parseNumber = (value: number | string | undefined) => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeActivity = (data: unknown): ActivityItem[] => {
  if (Array.isArray(data)) return data as ActivityItem[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: ActivityItem[]; items?: ActivityItem[] };
    return maybe.results || maybe.items || [];
  }
  return [];
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState<
    "deposit" | "withdraw" | null
  >(null);

  const fetchWalletData = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const [walletData, activityData] = await Promise.all([
        getWallet(),
        getWalletActivity(),
      ]);
      setWallet(walletData);
      setActivity(normalizeActivity(activityData));
    } catch (_e) {
      setNotice("Unable to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const currency = wallet?.currency || "USD";
  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(value);
    } catch {
      return `${value.toLocaleString()} ${currency}`;
    }
  };

  const handleDeposit = async () => {
    const amount = parseNumber(depositAmount);
    if (amount <= 0) {
      setNotice("Enter a valid deposit amount.");
      return;
    }

    setSubmitting("deposit");
    setNotice(null);
    try {
      await depositFunds(amount);
      setDepositAmount("");
      setNotice("Deposit request submitted.");
      await fetchWalletData();
    } catch (_e) {
      setNotice("Deposit request failed.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseNumber(withdrawAmount);
    if (amount <= 0) {
      setNotice("Enter a valid withdrawal amount.");
      return;
    }

    setSubmitting("withdraw");
    setNotice(null);
    try {
      await withdrawFunds(amount);
      setWithdrawAmount("");
      setNotice("Withdrawal request submitted.");
      await fetchWalletData();
    } catch (_e) {
      setNotice("Withdrawal request failed.");
    } finally {
      setSubmitting(null);
    }
  };

  const totalBalance = parseNumber(
    wallet?.balance ?? wallet?.total_balance
  );
  const availableBalance = parseNumber(
    wallet?.available_balance ?? wallet?.available ?? totalBalance
  );
  const pendingAmount = parseNumber(
    wallet?.pending_withdrawals ?? wallet?.pending
  );

  return (
    <DashboardShell>
      <AppShell>
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-ts-text-main">
              Wallet
            </h1>
            <p className="text-sm text-ts-text-muted">
              Manage your balance, deposits, and withdrawals.
            </p>
          </div>

          {notice && (
            <div className="text-sm text-ts-text-muted">
              {notice}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wide text-ts-text-muted">
                Total balance
              </p>
              <div className="mt-2 text-2xl font-semibold text-ts-text-main">
                {formatCurrency(totalBalance)}
              </div>
              <div className="mt-4 space-y-1 text-xs text-ts-text-muted">
                <p>
                  Available: {formatCurrency(availableBalance)}
                </p>
                <p>
                  Pending: {formatCurrency(pendingAmount)}
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-ts-text-main">
                Deposit funds
              </h2>
              <p className="text-xs text-ts-text-muted">
                Add money to your trading balance.
              </p>
              <div className="mt-4 space-y-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder={`Amount (${currency})`}
                  className="w-full rounded-md bg-ts-input-bg border border-ts-input-border px-3 py-2 text-sm focus:outline-none"
                />
                <Button
                  type="button"
                  onClick={handleDeposit}
                  disabled={submitting !== null || loading}
                  className="w-full bg-ts-primary text-white hover:opacity-90"
                >
                  {submitting === "deposit" ? "Processing..." : "Deposit"}
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-ts-text-main">
                Request withdrawal
              </h2>
              <p className="text-xs text-ts-text-muted">
                Submit a withdrawal request for review.
              </p>
              <div className="mt-4 space-y-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Amount (${currency})`}
                  className="w-full rounded-md bg-ts-input-bg border border-ts-input-border px-3 py-2 text-sm focus:outline-none"
                />
                <Button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={submitting !== null || loading}
                  className="w-full bg-ts-danger text-white hover:opacity-90"
                >
                  {submitting === "withdraw"
                    ? "Processing..."
                    : "Request withdrawal"}
                </Button>
              </div>
            </Card>
          </div>

          <ActivityTable
            items={activity}
            title="Wallet activity"
          />
        </div>
      </AppShell>
    </DashboardShell>
  );
}
