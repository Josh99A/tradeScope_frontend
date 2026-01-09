import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // REQUIRED for cookies
});

export default api;
