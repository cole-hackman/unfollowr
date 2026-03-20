const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const ANALYTICS_ENDPOINT = `${API_BASE}/api/analytics/event`;

export function trackEvent(eventType: string, metadata: Record<string, any> = {}) {
  if (!API_BASE) return;

  fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: eventType, metadata }),
    credentials: "include",
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(path: string) {
  if (typeof document === "undefined") return;
  trackEvent("page_view", { path, referrer: document.referrer });
}
