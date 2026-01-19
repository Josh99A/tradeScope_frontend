import api from "@/lib/axios";

export const getAdminDeposits = async () => {
  const response = await api.get("/admin/deposits/");
  return response.data;
};

export const getAdminWithdrawals = async () => {
  const response = await api.get("/admin/withdrawals/");
  return response.data;
};

export const confirmDeposit = async (id) => {
  const response = await api.post(`/admin/deposits/${id}/confirm/`, null);
  return response.data;
};

export const rejectDeposit = async (id) => {
  const response = await api.post(`/admin/deposits/${id}/reject/`, null);
  return response.data;
};

export const markWithdrawalProcessing = async (id) => {
  const response = await api.post(`/admin/withdrawals/${id}/processing/`, null);
  return response.data;
};

export const markWithdrawalPaid = async (id) => {
  const response = await api.post(`/admin/withdrawals/${id}/paid/`, null);
  return response.data;
};

export const rejectWithdrawal = async (id) => {
  const response = await api.post(`/admin/withdrawals/${id}/reject/`, null);
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get("/admin/users/");
  return response.data;
};

const ensureValidId = (id) => {
  if (id === null || id === undefined) {
    throw new Error("Invalid user id");
  }
  if (typeof id === "string" && id.trim().toLowerCase() === "undefined") {
    throw new Error("Invalid user id");
  }
  return id;
};

export const disableUser = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/admin/users/${safeId}/disable/`, null);
  return response.data;
};

export const enableUser = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/admin/users/${safeId}/enable/`, null);
  return response.data;
};

export const deleteUser = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/admin/users/${safeId}/delete/`, null);
  return response.data;
};
