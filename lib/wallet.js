import api from "@/lib/axios";

export const getWallet = async () => {
  const response = await api.get("/wallet/");
  return response.data;
};

export const depositFunds = async (amount) => {
  const response = await api.post("/wallet/deposit/", { amount });
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
