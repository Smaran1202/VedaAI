import axios from "axios";
import { getAuthToken } from "@/lib/auth-token";
import { getApiUrl } from "@/lib/env";

export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
