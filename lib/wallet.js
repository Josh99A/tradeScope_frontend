import api from "@/lib/axios";

export const getWallet = async () => {
  const response = await api.get("/wallet/");
  return response.data;
};

export const depositFunds = async ({ amount, asset, address }) => {
  const response = await api.post("/wallet/deposit/", {
    amount,
    asset,
    address,
  });
  return response.data;
};

export const withdrawFunds = async (amount) => {
  const response = await api.post("/wallet/withdraw/", { amount });
  return response.data;
};

export const getWalletActivity = async () => {
  const response = await api.get("/wallet/activity/");
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
