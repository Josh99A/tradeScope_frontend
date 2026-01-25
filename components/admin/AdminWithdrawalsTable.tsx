"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import AssetIcon from "@/components/ui/AssetIcon";
import { formatAmount } from "@/lib/formatters";

type AdminWithdrawal = {
  id?: number | string;
  amount?: number | string;
  asset?: string;
  network?: string;
  address?: string;
  proof?: string | null;
  fee?: number | string;
  status?: string;
  created_at?: string;
  user?: {
    id?: number | string;
    email?: string;
    username?: string;
    display_name?: string;
  };
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const getUserLabel = (user?: AdminWithdrawal["user"]) => {
  if (!user) return "--";
  return user.display_name || user.username || user.email || "--";
};

export default function AdminWithdrawalsTable({
  items,
  onProcessing,
  onPaid,
  onReject,
}: {
  items: AdminWithdrawal[];
  onProcessing: (id: number | string) => void;
  onPaid: (id: number | string) => void;
  onReject: (id: number | string) => void;
}) {
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const orderedItems = [...items].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  const copyAddress = async (item: AdminWithdrawal) => {
    if (!item.address) return;
    try {
      await navigator.clipboard.writeText(item.address);
      setCopiedId(item.id ?? "address");
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch (_e) {
      window.prompt("Copy address:", item.address);
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ts-text-main">Withdrawals</h2>
        <span className="text-xs text-ts-text-muted">{items.length} records</span>
      </div>

      {orderedItems.length === 0 ? (
        <p className="mt-4 text-sm text-ts-text-muted">No withdrawals found.</p>
      ) : (
        <>
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
                <tr>
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-left font-medium">User</th>
                  <th className="py-2 text-left font-medium">Asset</th>
                  <th className="py-2 text-left font-medium">Network</th>
                  <th className="py-2 text-left font-medium">Address</th>
                  <th className="py-2 text-left font-medium">Amount</th>
                  <th className="py-2 text-left font-medium">Fee</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-left font-medium">Proof</th>
                  <th className="py-2 text-left font-medium">Copy</th>
                  <th className="py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ts-border">
                {orderedItems.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                    <td className="py-3 pr-4">{getUserLabel(item.user)}</td>
                    <td className="py-3 pr-4">
                      <AssetIcon symbol={item.asset} size={24} />
                      <span className="sr-only">{item.asset || "--"}</span>
                    </td>
                    <td className="py-3 pr-4">{item.network || "--"}</td>
                    <td className="py-3 pr-4 max-w-[200px] truncate">
                      {item.address || "--"}
                    </td>
                    <td className="py-3 pr-4">{formatAmount(item.amount)}</td>
                    <td className="py-3 pr-4">{formatAmount(item.fee)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="py-3 pr-4">
                      {item.proof ? (
                        <a
                          href={item.proof}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-ts-primary hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Button
                        type="button"
                        onClick={() => copyAddress(item)}
                        disabled={!item.address}
                        className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
                      >
                        {copiedId === item.id ? "Copied" : "Copy"}
                      </Button>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => item.id && onProcessing(item.id)}
                          disabled={
                            !item.id ||
                            String(item.status).toLowerCase() !== "pending_review"
                          }
                          className="bg-ts-primary text-white hover:opacity-90"
                        >
                          Processing
                        </Button>
                        <Button
                          type="button"
                          onClick={() => item.id && onPaid(item.id)}
                          disabled={
                            !item.id ||
                            String(item.status).toLowerCase() === "paid"
                          }
                          className="bg-ts-success text-white hover:opacity-90"
                        >
                          Paid
                        </Button>
                        <Button
                          type="button"
                          onClick={() => item.id && onReject(item.id)}
                          disabled={
                            !item.id ||
                            String(item.status).toLowerCase() === "rejected"
                          }
                          className="bg-ts-danger text-white hover:opacity-90"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 md:hidden">
            {orderedItems.map((item, index) => (
              <div
                key={item.id ?? index}
                className="rounded-lg border border-ts-border bg-ts-bg-main p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-ts-text-muted">
                      {formatDate(item.created_at)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ts-text-main">
                      {getUserLabel(item.user)}
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      <AssetIcon symbol={item.asset} size={20} />
                      <span className="sr-only">
                        {item.asset || "--"} {item.network ? `(${item.network})` : ""}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      Amount:{" "}
                      <span className="text-ts-text-main">
                        {formatAmount(item.amount)}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-ts-text-muted">
                      Fee:{" "}
                      <span className="text-ts-text-main">
                        {formatAmount(item.fee)}
                      </span>
                    </p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
                <div className="mt-3 rounded-md border border-ts-border bg-ts-bg-card px-3 py-2 text-xs text-ts-text-muted">
                  <p className="truncate">
                    Address:{" "}
                    <span className="text-ts-text-main">{item.address || "--"}</span>
                  </p>
                  {item.proof && (
                    <a
                      href={item.proof}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-xs text-ts-primary hover:underline"
                    >
                      View proof
                    </a>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => copyAddress(item)}
                    disabled={!item.address}
                    className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
                  >
                    {copiedId === item.id ? "Copied" : "Copy address"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => item.id && onProcessing(item.id)}
                    disabled={
                      !item.id ||
                      String(item.status).toLowerCase() !== "pending_review"
                    }
                    className="bg-ts-primary text-white hover:opacity-90"
                  >
                    Processing
                  </Button>
                  <Button
                    type="button"
                    onClick={() => item.id && onPaid(item.id)}
                    disabled={
                      !item.id || String(item.status).toLowerCase() === "paid"
                    }
                    className="bg-ts-success text-white hover:opacity-90"
                  >
                    Paid
                  </Button>
                  <Button
                    type="button"
                    onClick={() => item.id && onReject(item.id)}
                    disabled={
                      !item.id ||
                      String(item.status).toLowerCase() === "rejected"
                    }
                    className="bg-ts-danger text-white hover:opacity-90"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
