export const publicEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL
} as const;

export function getApiUrl() {
  return publicEnv.apiUrl ?? "";
}
