const normalizeUrl = value => value?.trim().replace(/\/$/, "");

const configuredApiUrl = normalizeUrl(import.meta.env.VITE_API_URL);

if (import.meta.env.PROD && !configuredApiUrl) {
  console.error(
    "VITE_API_URL is not configured. Set it to the public CineMax backend URL in Vercel."
  );
}

export const API_URL =
  configuredApiUrl || (import.meta.env.DEV ? "http://localhost:8080" : window.location.origin);

export const SOCKET_URL = normalizeUrl(import.meta.env.VITE_SOCKET_URL) || API_URL;

const realtimeFlag = import.meta.env.VITE_ENABLE_REALTIME?.trim().toLowerCase();
export const REALTIME_ENABLED = realtimeFlag ? realtimeFlag === "true" : import.meta.env.DEV;
