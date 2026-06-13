"use client";

import { io } from "socket.io-client";
import { getSocketUrl } from "@/lib/env";

export const socket = io(getSocketUrl(), {
  autoConnect: false
});
