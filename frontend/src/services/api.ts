import axios from "axios";
import { getApiUrl } from "@/lib/env";

export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json"
  }
});
