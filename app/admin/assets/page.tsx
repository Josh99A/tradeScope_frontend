"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import AssetIcon from "@/components/ui/AssetIcon";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import {
  getAdminAssets,
  createAdminAsset,
  updateAdminAsset,
} from "@/lib/admin";

type AssetItem = {
  id: number | string;
  name: string;
  symbol: string;
  network: string;
  is_active: boolean;
  icon?: string | null;
  coincap_id?: string | null;
  deposit_address: string;
  deposit_qr_code: string;
  min_deposit: number | string;
  min_withdraw: number | string;
  withdraw_fee: number | string;
  created_at?: string;
  updated_at?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const normalizeList = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: T[]; items?: T[] };
    return maybe.results || maybe.items || [];
  }
  return [];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== "object") return fallback;
  if (
    "response" in error &&
    (error as { response?: { data?: any } }).response?.data
  ) {
    const data = (error as { response?: { data?: any } }).response?.data;
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;
    if (typeof data === "object") {
      const first = Object.values(data)[0];
      if (Array.isArray(first)) return String(first[0]);
      if (typeof first === "string") return first;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export default function AdminAssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = !!(user?.is_staff || user?.is_superuser);

  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [networkFilter, setNetworkFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AssetItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    network: "",
    is_active: true,
    icon: null as File | null,
    coincap_id: "",
    deposit_address: "",
    deposit_qr_code: null as File | null,
    min_deposit: "",
    min_withdraw: "",
    withdraw_fee: "",
  });

  const presets: Array<{
    name: string;
    symbol: string;
    networks: string[];
  }> = [
    { name: "Bitcoin", symbol: "BTC", networks: ["BTC"] },
    { name: "Ethereum", symbol: "ETH", networks: ["ERC20"] },
    { name: "Solana", symbol: "SOL", networks: ["SOLANA"] },
    { name: "USD Coin", symbol: "USDC", networks: ["ERC20", "SOLANA"] },
    { name: "Tether", symbol: "USDT", networks: ["ERC20", "TRC20"] },
    { name: "Dogecoin", symbol: "DOGE", networks: ["DOGE"] },
    { name: "XRP", symbol: "XRP", networks: ["XRP"] },
    { name: "Cardano", symbol: "ADA", networks: ["ADA"] },
  ];
  const presetNetworkMap = presets.reduce<Record<string, string[]>>(
    (acc, preset) => {
      acc[preset.symbol.toUpperCase()] = preset.networks;
      return acc;
    },
    {}
  );

  const coincapIdHints: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    XRP: "xrp",
    ADA: "cardano",
    DOGE: "dogecoin",
    LTC: "litecoin",
    BNB: "binance-coin",
    TRX: "tron",
    DOT: "polkadot",
    AVAX: "avalanche",
    MATIC: "polygon",
    LINK: "chainlink",
    ATOM: "cosmos",
    BCH: "bitcoin-cash",
    USDT: "tether",
    USDC: "usd-coin",
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  const loadAssets = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const data = await getAdminAssets();
      setAssets(normalizeList<AssetItem>(data));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load assets.");
      setNotice(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadAssets();
    }
  }, [authLoading, isAdmin]);

  const networks = useMemo(() => {
    const set = new Set(assets.map((item) => item.network));
    return ["all", ...Array.from(set)];
  }, [assets]);

  const filteredAssets = assets.filter((asset) => {
    if (status === "active" && !asset.is_active) return false;
    if (status === "inactive" && asset.is_active) return false;
    if (networkFilter !== "all" && asset.network !== networkFilter) return false;
    const search = query.trim().toLowerCase();
    if (!search) return true;
    return (
      asset.name.toLowerCase().includes(search) ||
      asset.symbol.toLowerCase().includes(search) ||
      asset.network.toLowerCase().includes(search)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      symbol: "",
      network: "",
      is_active: true,
      icon: null,
      coincap_id: "",
      deposit_address: "",
      deposit_qr_code: null,
      min_deposit: "",
      min_withdraw: "",
      withdraw_fee: "",
    });
    setModalOpen(true);
  };

  const openEdit = (asset: AssetItem) => {
    setEditing(asset);
    setForm({
      name: asset.name,
      symbol: asset.symbol,
      network: asset.network,
      is_active: asset.is_active,
      icon: null,
      coincap_id: asset.coincap_id || "",
      deposit_address: asset.deposit_address,
      deposit_qr_code: null,
      min_deposit: String(asset.min_deposit),
      min_withdraw: String(asset.min_withdraw),
      withdraw_fee: String(asset.withdraw_fee),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setNotice(null);
    if (!form.name || !form.symbol || !form.network) {
      const message = "Name, symbol, and network are required.";
      setNotice(message);
      toast.error(message);
      return;
    }
    if (
      form.min_deposit === "" ||
      form.min_withdraw === "" ||
      form.withdraw_fee === ""
    ) {
      const message = "Min deposit, min withdraw, and withdraw fee are required.";
      setNotice(message);
      toast.error(message);
      return;
    }
    if (form.is_active && !form.deposit_address) {
      const message = "Deposit address is required for active assets.";
      setNotice(message);
      toast.error(message);
      return;
    }
    if (form.is_active && !form.deposit_qr_code && !editing?.deposit_qr_code) {
      const message = "Deposit QR code is required for active assets.";
      setNotice(message);
      toast.error(message);
      return;
    }

    const body = new FormData();
    body.append("name", form.name);
    body.append("symbol", form.symbol.toUpperCase());
    body.append("network", form.network);
    body.append("is_active", String(form.is_active));
    if (form.coincap_id) {
      body.append("coincap_id", form.coincap_id);
    }
    body.append("deposit_address", form.deposit_address);
    body.append("min_deposit", form.min_deposit);
    body.append("min_withdraw", form.min_withdraw);
    body.append("withdraw_fee", form.withdraw_fee);
    if (form.icon) {
      body.append("icon", form.icon);
    }
    if (form.deposit_qr_code) {
      body.append("deposit_qr_code", form.deposit_qr_code);
    }

    try {
      setIsSaving(true);
      if (editing) {
        await updateAdminAsset(editing.id, body);
        toast.success("Asset updated.");
      } else {
        await createAdminAsset(body);
        toast.success("Asset created.");
      }
      setModalOpen(false);
      await loadAssets();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save asset.");
      setNotice(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (asset: AssetItem) => {
    const actionLabel = asset.is_active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${asset.symbol}?`)) {
      return;
    }
    try {
      await updateAdminAsset(asset.id, {
        is_active: !asset.is_active,
      });
      await loadAssets();
      toast.success(`Asset ${asset.is_active ? "deactivated" : "activated"}.`);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update asset status.");
      setNotice(message);
      toast.error(message);
    }
  };

  if (authLoading) return null;
  if (!isAdmin) return null;

  return (
    <DashboardShell>
      <AppShell>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-ts-text-main">
                Assets
              </h1>
              <p className="text-sm text-ts-text-muted">
                Manage deposit and withdrawal assets.
              </p>
            </div>
            <Button
              type="button"
              onClick={openCreate}
              className="w-full bg-ts-primary text-white hover:opacity-90 sm:w-auto"
            >
              Add asset
            </Button>
          </div>

          {notice && <div className="text-sm text-ts-text-muted">{notice}</div>}

          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search symbol, name, network"
                className="w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
              />
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "all" | "active" | "inactive")
                }
                className="w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm sm:w-40"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={networkFilter}
                onChange={(event) => setNetworkFilter(event.target.value)}
                className="w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm sm:w-48"
              >
                {networks.map((network) => (
                  <option key={network} value={network}>
                    {network === "all" ? "All networks" : network}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <Card>
            {loading ? (
              <p className="text-sm text-ts-text-muted">Loading assets...</p>
            ) : filteredAssets.length === 0 ? (
              <p className="text-sm text-ts-text-muted">No assets found.</p>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[960px] text-sm">
                  <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
                    <tr>
                      <th className="py-2 text-left font-medium">Asset</th>
                      <th className="py-2 text-left font-medium">QR</th>
                      <th className="py-2 text-left font-medium">Network</th>
                      <th className="py-2 text-left font-medium">Status</th>
                      <th className="py-2 text-left font-medium">Min deposit (USD)</th>
                      <th className="py-2 text-left font-medium">Min withdraw (USD)</th>
                      <th className="py-2 text-left font-medium">Fee (USD)</th>
                      <th className="py-2 text-left font-medium">Updated</th>
                      <th className="py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ts-border">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="py-3 pr-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ts-border bg-ts-bg-main">
                            <AssetIcon symbol={asset.symbol} size={28} />
                          </div>
                          <span className="sr-only">
                            {asset.name} ({asset.symbol})
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <img
                            src={asset.deposit_qr_code}
                            alt={`${asset.symbol} QR`}
                            className="h-10 w-10 rounded-md border border-ts-border bg-white p-1"
                          />
                        </td>
                        <td className="py-3 pr-4">{asset.network}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge
                            value={asset.is_active ? "active" : "inactive"}
                          />
                        </td>
                        <td className="py-3 pr-4">${asset.min_deposit}</td>
                        <td className="py-3 pr-4">${asset.min_withdraw}</td>
                        <td className="py-3 pr-4">${asset.withdraw_fee}</td>
                        <td className="py-3 pr-4">
                          {formatDate(asset.updated_at)}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={() => openEdit(asset)}
                              className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              onClick={() => toggleActive(asset)}
                              className={
                                asset.is_active
                                  ? "bg-ts-danger text-white hover:opacity-90"
                                  : "bg-ts-success text-white hover:opacity-90"
                              }
                            >
                              {asset.is_active ? "Deactivate asset" : "Activate asset"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                <div className="grid gap-3 md:hidden">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-lg border border-ts-border bg-ts-bg-main p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ts-border bg-ts-bg-main">
                            <AssetIcon symbol={asset.symbol} size={28} />
                          </div>
                          <span className="sr-only">
                            {asset.name} ({asset.symbol})
                          </span>
                        </div>
                        <StatusBadge
                          value={asset.is_active ? "active" : "inactive"}
                        />
                      </div>
                      <p className="mt-2 text-xs text-ts-text-muted">
                        Network:{" "}
                        <span className="text-ts-text-main">{asset.network}</span>
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ts-text-muted">
                        <div>
                          <p>Min deposit</p>
                          <p className="text-ts-text-main">
                            ${asset.min_deposit}
                          </p>
                        </div>
                        <div>
                          <p>Min withdraw</p>
                          <p className="text-ts-text-main">
                            ${asset.min_withdraw}
                          </p>
                        </div>
                        <div>
                          <p>Fee</p>
                          <p className="text-ts-text-main">
                            ${asset.withdraw_fee}
                          </p>
                        </div>
                        <div>
                          <p>Updated</p>
                          <p className="text-ts-text-main">
                            {formatDate(asset.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => openEdit(asset)}
                          className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          onClick={() => toggleActive(asset)}
                          className={
                            asset.is_active
                              ? "bg-ts-danger text-white hover:opacity-90"
                              : "bg-ts-success text-white hover:opacity-90"
                          }
                        >
                          {asset.is_active ? "Deactivate asset" : "Activate asset"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-16 pb-24 sm:items-center sm:p-6">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                if (isSaving) return;
                setModalOpen(false);
              }}
              aria-label="Close"
            />
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-ts-border bg-ts-bg-card p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ts-text-main">
                  {editing ? "Edit asset" : "Add asset"}
                </h2>
                <Button
                  type="button"
                  onClick={() => {
                    if (isSaving) return;
                    setModalOpen(false);
                  }}
                  className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
                  disabled={isSaving}
                >
                  Close
                </Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-ts-text-muted">
                    Common presets
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={`${preset.symbol}-${preset.networks.join("-")}`}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        name: preset.name,
                        symbol: preset.symbol,
                        network: preset.networks[0] || "",
                        coincap_id:
                          coincapIdHints[preset.symbol.toUpperCase()] || "",
                      }))
                    }
                    title={`${preset.symbol} • ${preset.networks.join(", ")}`}
                    className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
                  >
                    <AssetIcon symbol={preset.symbol} size={20} />
                    <span className="text-xs font-semibold text-ts-text-main">
                      {preset.symbol}
                    </span>
                    <span className="text-[11px] text-ts-text-muted">
                      {preset.networks.join(", ")}
                    </span>
                  </Button>
                ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="asset-name" className="text-xs text-ts-text-muted">
                    Asset name <span className="text-ts-danger">*</span>
                  </label>
                  <input
                    id="asset-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="e.g. Tether"
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="asset-symbol" className="text-xs text-ts-text-muted">
                    Symbol <span className="text-ts-danger">*</span>
                  </label>
                  <input
                    id="asset-symbol"
                    value={form.symbol}
                    onChange={(event) =>
                      setForm((prev) => {
                        const nextSymbol = event.target.value.toUpperCase();
                        return {
                          ...prev,
                          symbol: nextSymbol,
                          coincap_id:
                            prev.coincap_id ||
                            coincapIdHints[nextSymbol] ||
                            "",
                        };
                      })
                    }
                    placeholder="e.g. USDT"
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="asset-network" className="text-xs text-ts-text-muted">
                    Network <span className="text-ts-danger">*</span>
                  </label>
                  <input
                    id="asset-network"
                    value={form.network}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, network: event.target.value }))
                    }
                    placeholder="e.g. TRC20"
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  />
                  {form.symbol && presetNetworkMap[form.symbol.toUpperCase()] ? (
                    <p className="mt-1 text-xs text-ts-text-muted">
                      Common networks:{" "}
                      {presetNetworkMap[form.symbol.toUpperCase()].join(", ")}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="asset-status" className="text-xs text-ts-text-muted">
                    Status
                  </label>
                  <select
                    id="asset-status"
                    value={form.is_active ? "true" : "false"}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        is_active: event.target.value === "true",
                      }))
                    }
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="asset-coincap" className="text-xs text-ts-text-muted">
                    CoinCap ID (auto-filled)
                  </label>
                  <input
                    id="asset-coincap"
                    value={form.coincap_id}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, coincap_id: event.target.value }))
                    }
                    placeholder="e.g. bitcoin"
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-ts-text-muted">
                    Used to fetch live USD rates from CoinCap.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="asset-icon" className="text-xs text-ts-text-muted">
                    Symbol icon (optional)
                  </label>
                  <input
                    id="asset-icon"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        icon: event.target.files?.[0] || null,
                      }))
                    }
                    className="mt-2 w-full text-xs text-ts-text-muted file:mr-3 file:rounded-md file:border file:border-ts-border file:bg-ts-bg-main file:px-3 file:py-1 file:text-xs file:text-ts-text-main hover:file:border-ts-primary/40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="asset-deposit-address" className="text-xs text-ts-text-muted">
                    Deposit address <span className="text-ts-danger">*</span>
                  </label>
                  <input
                    id="asset-deposit-address"
                    value={form.deposit_address}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        deposit_address: event.target.value,
                      }))
                    }
                    placeholder="Public deposit address"
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="asset-deposit-qr" className="text-xs text-ts-text-muted">
                    Deposit QR code <span className="text-ts-danger">*</span>
                  </label>
                  <input
                    id="asset-deposit-qr"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        deposit_qr_code: event.target.files?.[0] || null,
                      }))
                    }
                    className="mt-2 w-full text-xs text-ts-text-muted file:mr-3 file:rounded-md file:border file:border-ts-border file:bg-ts-bg-main file:px-3 file:py-1 file:text-xs file:text-ts-text-main hover:file:border-ts-primary/40"
                  />
                </div>
                <div>
                  <label htmlFor="asset-min-deposit" className="text-xs text-ts-text-muted">
                    Minimum deposit (USD) <span className="text-ts-danger">*</span>
                  </label>
                  <input
                    id="asset-min-deposit"
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.min_deposit}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        min_deposit: event.target.value,
                      }))
                    }
                    placeholder="e.g. 50.00"
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="asset-min-withdraw" className="text-xs text-ts-text-muted">
                    Minimum withdraw (USD) <span className="text-ts-danger">*</span>
                  </label>
                  <input
                    id="asset-min-withdraw"
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.min_withdraw}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        min_withdraw: event.target.value,
                      }))
                    }
                    placeholder="e.g. 100.00"
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="asset-withdraw-fee" className="text-xs text-ts-text-muted">
                    Withdraw fee (USD) <span className="text-ts-danger">*</span>
                  </label>
                  <input
                    id="asset-withdraw-fee"
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.withdraw_fee}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        withdraw_fee: event.target.value,
                      }))
                    }
                    placeholder="e.g. 2.50"
                    className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    if (isSaving) return;
                    setModalOpen(false);
                  }}
                  className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-ts-primary text-white hover:opacity-90"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </DashboardShell>
  );
}
