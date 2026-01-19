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

export const getActivity = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.includeArchived) params.set("include_archived", "true");
  if (options.includeDeleted) params.set("include_deleted", "true");
  const query = params.toString();
  const response = await api.get(`/activity/${query ? `?${query}` : ""}`);
  return response.data;
};

export const getAdminActivity = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.includeArchived) params.set("include_archived", "true");
  if (options.includeDeleted) params.set("include_deleted", "true");
  const query = params.toString();
  const response = await api.get(`/admin/activity/${query ? `?${query}` : ""}`);
  return response.data;
};

export const archiveActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/activity/${safeId}/archive/`, null);
  return response.data;
};

export const restoreActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/activity/${safeId}/restore/`, null);
  return response.data;
};

export const deleteActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/activity/${safeId}/delete/`, null);
  return response.data;
};

export const archiveAdminActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/admin/activity/${safeId}/archive/`, null);
  return response.data;
};

export const restoreAdminActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/admin/activity/${safeId}/restore/`, null);
  return response.data;
};

export const deleteAdminActivity = async (id) => {
  const safeId = ensureValidId(id);
  const response = await api.post(`/admin/activity/${safeId}/delete/`, null);
  return response.data;
};
