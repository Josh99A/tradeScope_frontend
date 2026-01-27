import axios from "axios";

let hasSessionExpiredNotice = false;

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // REQUIRED for cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error?.response?.status;
      if (status === 401 && !hasSessionExpiredNotice) {
        hasSessionExpiredNotice = true;
        window.dispatchEvent(new Event("ts-session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export const resetSessionExpiredNotice = () => {
  hasSessionExpiredNotice = false;
};

export default api;
