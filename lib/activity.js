import api from "@/lib/axios";

export const getActivity = async () => {
  const response = await api.get("/activity/");
  return response.data;
};

export const getAdminActivity = async () => {
  const response = await api.get("/admin/activity/");
  return response.data;
};
