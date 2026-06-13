export const publicEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL
} as const;

export function getApiUrl() {
  return publicEnv.apiUrl ?? "";
}

export function getSocketUrl() {
  return publicEnv.socketUrl ?? getApiUrl();
}
