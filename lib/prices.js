import api from "@/lib/axios";

export const getPrices = async (assets = []) => {
  const list = Array.isArray(assets) ? assets : [];
  const params = new URLSearchParams();
  if (list.length) {
    params.set("assets", list.join(","));
  }
  const query = params.toString();
  const response = await api.get(`/prices${query ? `?${query}` : ""}`);
  return response.data;
};
