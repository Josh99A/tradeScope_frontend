export const formatAmount = (
  value?: number | string,
  options?: { maxFractionDigits?: number }
) => {
  if (value === null || value === undefined || value === "") return "--";
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: options?.maxFractionDigits ?? 8,
  }).format(numeric);
};
