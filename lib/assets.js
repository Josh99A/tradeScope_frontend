import api from "@/lib/axios";

export const getActiveAssets = async () => {
  const response = await api.get("/assets/");
  return response.data;
};
