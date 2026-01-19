"use client";

import React from "react";

const getTone = (value?: string) => {
  const status = (value || "").toLowerCase();
  if (["confirmed", "success", "paid", "approved", "active"].includes(status)) {
    return "bg-ts-success/15 text-ts-success border-ts-success/40";
  }
  if (["rejected", "failed", "disabled", "inactive"].includes(status)) {
    return "bg-ts-danger/15 text-ts-danger border-ts-danger/40";
  }
  if (["processing"].includes(status)) {
    return "bg-ts-primary/15 text-ts-primary border-ts-primary/40";
  }
  if (["pending", "queued", "waiting", "pending_review"].includes(status)) {
    return "bg-ts-warning/15 text-ts-warning border-ts-warning/40";
  }
  return "bg-ts-border/30 text-ts-text-muted border-ts-border";
};

const formatLabel = (value?: string) => {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
};

export default function StatusBadge({ value }: { value?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getTone(
        value
      )}`}
    >
      {formatLabel(value)}
    </span>
  );
}
