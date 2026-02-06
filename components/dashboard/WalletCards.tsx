"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
type WalletCardsProps = {
  totalUsd?: number | null;
  holdingsCount?: number | null;
  loading?: boolean;
  pendingDeposit?: boolean;
  pendingWithdrawal?: boolean;
  onWithdraw?: () => void;
  withdrawDisabled?: boolean;
};

export default function WalletCards({
  totalUsd,
  holdingsCount,
  loading = false,
  pendingDeposit = false,
  pendingWithdrawal = false,
  onWithdraw,
  withdrawDisabled = false,
}: WalletCardsProps) {
  const router = useRouter();
  const hasTotal = typeof totalUsd === "number" && Number.isFinite(totalUsd);
  const formattedTotal =
    !loading && hasTotal
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(totalUsd)
      : "--";
  const formattedHoldings =
    !loading && typeof holdingsCount === "number"
      ? holdingsCount.toLocaleString()
      : "--";
  const disableWithdraw = withdrawDisabled || loading || pendingWithdrawal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <p className="text-xs uppercase tracking-wide text-ts-text-muted">
          Total available (USD estimate)
        </p>
        <div className="mt-2 text-2xl font-semibold text-ts-text-main">
          {formattedTotal}
        </div>
        <p className="mt-4 text-xs text-ts-text-muted">
          Based on cached crypto price estimates.
        </p>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-ts-text-muted">
          Holdings count
        </p>
        <div className="mt-2 text-2xl font-semibold text-ts-text-main">
          {formattedHoldings}
        </div>
        <p className="mt-4 text-xs text-ts-text-muted">
          Active crypto assets with balances.
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-ts-text-main">Withdrawals</h2>
        <p className="text-xs text-ts-text-muted">
          Submit a withdrawal request for review.
        </p>
        {pendingDeposit && (
          <div className="mt-3 rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-xs text-ts-text-main">
            You have a pending deposit request. Withdrawals are processed within 24
            hours. Do not submit multiple requests.
          </div>
        )}
        {pendingWithdrawal && (
          <div className="mt-3 rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-xs text-ts-text-main">
            Your withdrawal request is pending and will be processed within 24
            hours.
          </div>
        )}
        <div className="mt-4">
          <Button
            type="button"
            onClick={onWithdraw ?? (() => router.push("/wallet"))}
            disabled={disableWithdraw}
            className="w-full bg-ts-danger text-white hover:opacity-90"
          >
            Request withdrawal
          </Button>
        </div>
      </Card>
    </div>
  );
}
