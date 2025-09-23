export async function track(event: string, data: Record<string, any> = {}) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  try {
    await fetch(`${base}/api/metrics`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, data, ts: Date.now() })
    });
  } catch {}
}
