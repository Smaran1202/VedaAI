"use client";

import { io } from "socket.io-client";
import { getApiUrl } from "@/lib/env";

export const socket = io(getApiUrl(), {
  autoConnect: false
});
