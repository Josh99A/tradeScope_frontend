"use client";

import { Button } from "@/components/ui/Button";

export default function SessionExpiredModal({
  open,
  onConfirm,
  onDismiss,
  busy,
}: {
  open: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  busy?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-16 pb-24 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close session expired modal"
        onClick={onDismiss}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-ts-border bg-ts-bg-card p-5 shadow-xl sm:p-6">
        <h2 id="session-expired-title" className="text-lg font-semibold">
          Session expired
        </h2>
        <p className="mt-2 text-sm text-ts-text-muted">
          Your session has expired. Confirm to refresh your login session.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={onDismiss}
            className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
            disabled={busy}
          >
            Dismiss
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-ts-primary text-white hover:opacity-90"
            disabled={busy}
          >
            {busy ? "Refreshing..." : "Refresh session"}
          </Button>
        </div>
      </div>
    </div>
  );
}
