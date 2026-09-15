/** Public base URL of the app: PUBLIC_APP_URL when set, otherwise taken from the request. */
export function appUrlFromHeaders(h: { get(name: string): string | null }) {
  const configured = process.env.PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
