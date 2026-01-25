import api from "@/lib/axios";

const ensureValidId = (id) => {
  if (id === null || id === undefined) {
    throw new Error("Invalid activity id");
  }
  const text = String(id).trim().toLowerCase();
  if (!text || text === "undefined" || text === "null") {
    throw new Error("Invalid activity id");
  }
  return id;
};

export const getWallet = async () => {
  const response = await api.get("/wallet/");
  return response.data;
};

export const getWalletSnapshot = async () => {
  const [wallet, holdings] = await Promise.all([
    api.get("/wallet/"),
    api.get("/holdings/"),
  ]);
  console.log("Wallet data:", wallet.data);
  console.log("Holdings data:", holdings.data);
  return { wallet: wallet.data, holdings: holdings.data };
};

export const depositFunds = async ({ amount, asset_id }) => {
  const response = await api.post("/wallet/deposit/", {
    amount,
    asset_id,
  });
  return response.data;
};

export const withdrawFunds = async ({
  amount,
  asset_id,
  fee,
  address,
  proof,
}) => {
  const formData = new FormData();
  formData.append("amount", String(amount));
  if (asset_id) formData.append("asset_id", String(asset_id));
  if (fee !== undefined) formData.append("fee", String(fee));
  if (address) formData.append("address", address);
  if (proof) formData.append("proof", proof);
  const response = await api.post("/wallet/withdraw/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getWalletActivity = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.includeArchived) params.set("include_archived", "true");
  if (options.includeDeleted) params.set("include_deleted", "true");
  const query = params.toString();
  const response = await api.get(`/wallet/activity/${query ? `?${query}` : ""}`);
  return response.data;
};

export const archiveWalletActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/wallet/activity/${safeId}/archive/`, null);
  return response.data;
};

export const restoreWalletActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/wallet/activity/${safeId}/restore/`, null);
  return response.data;
};

export const deleteWalletActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/wallet/activity/${safeId}/delete/`, null);
  return response.data;
};

export const getDeposits = async () => {
  const response = await api.get("/deposits/");
  return response.data;
};

export const getWithdrawals = async () => {
  const response = await api.get("/withdrawals/");
  return response.data;
};

export const getHoldings = async () => {
  const response = await api.get("/holdings/");
  return response.data;
};
