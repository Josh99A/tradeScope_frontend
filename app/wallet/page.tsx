"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ActivityTable from "@/components/wallet/ActivityTable";
import StatusTable from "@/components/wallet/StatusTable";
import {
  getWallet,
  depositFunds,
  withdrawFunds,
  getWalletActivity,
  getDeposits,
  getWithdrawals,
} from "@/lib/wallet";
import DepositModal from "@/components/deposit/DepositModal";

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
  const [deposits, setDeposits] = useState<ActivityItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState<
    "deposit" | "withdraw" | null
  >(null);
  const [depositOpen, setDepositOpen] = useState(false);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error && "response" in error) {
      const data = (error as { response?: { data?: unknown } }).response?.data;
      if (data && typeof data === "object") {
        const detail = (data as { detail?: string }).detail;
        if (detail) return detail;
        const firstKey = Object.keys(data as Record<string, unknown>)[0];
        if (firstKey) {
          const value = (data as Record<string, unknown>)[firstKey];
          if (Array.isArray(value)) return String(value[0]);
          if (typeof value === "string") return value;
        }
      }
    }
    return fallback;
  };

  const fetchWalletData = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const [walletData, activityData, depositsData, withdrawalsData] =
        await Promise.all([
        getWallet(),
        getWalletActivity(),
        getDeposits(),
        getWithdrawals(),
      ]);
      setWallet(walletData);
      setActivity(normalizeActivity(activityData));
      setDeposits(normalizeActivity(depositsData));
      setWithdrawals(normalizeActivity(withdrawalsData));
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
    } catch (error) {
      setNotice(
        getErrorMessage(
          error,
          "Withdrawal request failed."
        )
      );
    } finally {
      setSubmitting(null);
    }
  };

  const availableBalance = parseNumber(wallet?.available_balance);
  const lockedBalance = parseNumber(wallet?.locked_balance);
  const totalBalance = availableBalance + lockedBalance;
  const pendingAmount = lockedBalance;
  const pendingDeposit = deposits.some(
    (deposit) => String(deposit.status).toUpperCase() === "PENDING_REVIEW"
  );
  const pendingWithdrawal = withdrawals.some((withdrawal) => {
    const status = String(withdrawal.status).toUpperCase();
    return status === "PENDING_REVIEW" || status === "PROCESSING";
  });
  const withdrawalOverLimit =
    parseNumber(withdrawAmount) > 0 &&
    parseNumber(withdrawAmount) > availableBalance;

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
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => setDepositOpen(true)}
              className="bg-ts-primary text-white hover:opacity-90"
            >
              Deposit
            </Button>
          </div>

          {notice && (
            <div className="text-sm text-ts-text-muted">
              {notice}
            </div>
          )}
          {pendingDeposit && (
            <div className="rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-sm text-ts-text-main">
              You already have a pending deposit request. Please wait for
              admin confirmation.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wide text-ts-text-muted">
                Available balance
              </p>
              <div className="mt-2 text-2xl font-semibold text-ts-text-main">
                {formatCurrency(availableBalance)}
              </div>
              <div className="mt-4 space-y-1 text-xs text-ts-text-muted">
                <p>
                  Total: {formatCurrency(totalBalance)}
                </p>
                <p>
                  Locked: {formatCurrency(pendingAmount)}
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-ts-text-main">
                Request withdrawal
              </h2>
              <p className="text-xs text-ts-text-muted">
                Submit a withdrawal request for review.
              </p>
              {pendingDeposit && (
                <div className="mt-3 rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-xs text-ts-text-main">
                  You have a pending deposit request. Withdrawals are
                  processed within 24 hours. Do not submit multiple requests.
                </div>
              )}
              {pendingWithdrawal && (
                <div className="mt-3 rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-xs text-ts-text-main">
                  Your withdrawal request is pending and will be processed
                  within 24 hours.
                </div>
              )}
              <div className="mt-4 space-y-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Amount (${currency})`}
                  className="w-full rounded-md bg-ts-input-bg border border-ts-input-border px-3 py-2 text-sm focus:outline-none"
                  aria-invalid={withdrawalOverLimit}
                  aria-describedby="withdrawal-help"
                />
                <p
                  id="withdrawal-help"
                  className={`text-xs ${
                    withdrawalOverLimit
                      ? "text-ts-danger"
                      : "text-ts-text-muted"
                  }`}
                >
                  {withdrawalOverLimit
                    ? "Amount exceeds your available balance."
                    : "Enter the amount you want to withdraw."}
                </p>
                <Button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={
                    submitting !== null ||
                    loading ||
                    pendingWithdrawal ||
                    withdrawalOverLimit
                  }
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatusTable
              title="Deposits"
              items={deposits}
              emptyLabel="No deposits yet."
            />
            <StatusTable
              title="Withdrawals"
              items={withdrawals}
              emptyLabel="No withdrawals yet."
            />
          </div>
        </div>
      </AppShell>

      <DepositModal
        open={depositOpen}
        onOpenChange={setDepositOpen}
        locked={pendingDeposit}
        lockMessage="You already have a pending deposit request. Please wait for admin confirmation."
        onConfirm={async ({ asset, amount, address }) => {
          setSubmitting("deposit");
          setNotice(null);
          try {
            await depositFunds({ amount, asset, address });
            setDepositOpen(false);
            setNotice("Deposit request submitted.");
            await fetchWalletData();
          } catch (error) {
            setNotice(
              getErrorMessage(
                error,
                "Deposit request failed."
              )
            );
          } finally {
            setSubmitting(null);
          }
        }}
      />
    </DashboardShell>
  );
}
