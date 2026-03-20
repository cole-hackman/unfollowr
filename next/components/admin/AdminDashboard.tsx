"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type TrendPoint = { date: string; label: string; value: number };
type KpiMetric = { current: number; previous: number; period: string };
type KpisResponse = {
  analyses: KpiMetric;
  page_views: KpiMetric;
  unique_users: KpiMetric;
  ai_classifications: KpiMetric;
};
type TrendsResponse = {
  period: string;
  analyses: { current: TrendPoint[]; previous: TrendPoint[] };
  page_views: { current: TrendPoint[]; previous: TrendPoint[] };
};
type BreakdownSlice = { label: string; value: number; color?: string };
type TopPage = { path: string; views: number };
type BreakdownResponse = {
  export_formats: BreakdownSlice[];
  account_categories: BreakdownSlice[];
  traffic_sources: { label: string; value: number }[];
  top_pages: TopPage[];
  engagement: {
    avg_session_duration: string;
    pages_per_session: number;
    bounce_rate: number;
    avg_accounts_processed: number;
  };
};
type RecentItem = {
  id: number;
  relative_time: string;
  metadata: {
    accounts_count?: number;
    non_followers?: number;
    export_format?: string;
    ai_used?: boolean;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function emptyKpis(): KpisResponse {
  return {
    analyses: { current: 0, previous: 0, period: "past 7 days" },
    page_views: { current: 0, previous: 0, period: "past 7 days" },
    unique_users: { current: 0, previous: 0, period: "past 7 days" },
    ai_classifications: { current: 0, previous: 0, period: "past 7 days" },
  };
}

function emptyTrends(): TrendsResponse {
  return {
    period: "past 7 days",
    analyses: { current: [], previous: [] },
    page_views: { current: [], previous: [] },
  };
}

function emptyBreakdowns(): BreakdownResponse {
  return {
    export_formats: [
      { label: "HTML", value: 0 },
      { label: "JSON", value: 0 },
    ],
    account_categories: [
      { label: "Non-followers", value: 0, color: "#EF4444" },
      { label: "Mutuals", value: 0, color: "#22C55E" },
      { label: "Fans", value: 0, color: "#F59E0B" },
    ],
    traffic_sources: [],
    top_pages: [],
    engagement: {
      avg_session_duration: "0s",
      pages_per_session: 0,
      bounce_rate: 0,
      avg_accounts_processed: 0,
    },
  };
}

// --- Sparkline Component ---
function Sparkline({ data, width = 180, height = 48, color = "#2563EB", showArea = true }: { data: TrendPoint[]; width?: number; height?: number; color?: string; showArea?: boolean }) {
  const safeData = data.length ? data : [{ date: "", label: "", value: 0 }, { date: "", label: "", value: 0 }];
  const values = safeData.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;

  const points = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const areaPoints = [`${pad},${height}`, ...points, `${width - pad},${height}`].join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {showArea && <polygon points={areaPoints} fill={color} opacity="0.1" />}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Mini Bar Chart ---
function MiniBarChart({ data, height = 120 }: { data: BreakdownSlice[]; height?: number }) {
  const safeData = data.length ? data : [{ label: "None", value: 0 }];
  const maxVal = Math.max(...safeData.map((d) => d.value), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, padding: "0 4px" }}>
      {safeData.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 6 }}>
          <span style={{ fontSize: 11, color: "#94A3B8", fontVariantNumeric: "tabular-nums" }}>{d.value}%</span>
          <div
            style={{
              width: "100%",
              maxWidth: 48,
              height: `${(d.value / maxVal) * (height - 32)}px`,
              background: i === 0 ? "#2563EB" : "#60A5FA",
              borderRadius: "4px 4px 0 0",
              transition: "height 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          <span style={{ fontSize: 10, color: "#64748B", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// --- Donut Chart ---
function DonutChart({ data, size = 120 }: { data: BreakdownSlice[]; size?: number }) {
  const safeData = data.length ? data : [{ label: "None", value: 100, color: "#1E293B" }];
  const total = safeData.reduce((a, b) => a + b.value, 0) || 1;
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {safeData.map((d, i) => {
          const pct = d.value / total;
          const dash = circumference * pct;
          const gap = circumference - dash;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color || "#2563EB"}
              strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease" }}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", fontFamily: "'JetBrains Mono', monospace" }}>{total}%</span>
      </div>
    </div>
  );
}

// --- Trend Line Chart ---
function TrendChart({ current, previous, width = "100%", height = 160, color = "#2563EB", prevColor = "#475569" }: { current: TrendPoint[]; previous: TrendPoint[]; width?: string; height?: number; color?: string; prevColor?: string }) {
  const svgRef = useRef<HTMLDivElement | null>(null);
  const [svgWidth, setSvgWidth] = useState(400);
  const safeCurrent = current.length ? current : [{ date: "", label: "", value: 0 }, { date: "", label: "", value: 0 }];
  const safePrevious = previous.length ? previous : safeCurrent;

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setSvgWidth(entry.contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const drawLine = (data: TrendPoint[], w: number, h: number) => {
    const vals = data.map((d) => d.value);
    const prevVals = safePrevious.map((d) => d.value);
    const min = Math.min(...vals, ...prevVals);
    const max = Math.max(...vals, ...prevVals);
    const range = max - min || 1;
    const pad = 4;
    return vals
      .map((v, i) => {
        const x = pad + (i / Math.max(vals.length - 1, 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2 - 20) - 10;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const labelStep = safeCurrent.length <= 7 ? 1 : safeCurrent.length <= 24 ? 6 : 7;
  const labels = safeCurrent.filter((_, i) => i % labelStep === 0).map((d) => d.label);

  return (
    <div style={{ width, position: "relative" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 11, color: "#94A3B8" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
          current period
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: prevColor, display: "inline-block" }} />
          prev period
        </span>
      </div>
      <div ref={svgRef}>
        <svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`} preserveAspectRatio="none">
          <polyline points={drawLine(safePrevious, svgWidth, height)} fill="none" stroke={prevColor} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
          <polyline points={drawLine(safeCurrent, svgWidth, height)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748B", marginTop: 4, padding: "0 4px" }}>
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

// --- Gauge ---
function Gauge({ value, max = 100, label, size = 100 }: { value: number; max?: number; label: string; size?: number }) {
  const radius = 36;
  const circumference = Math.PI * radius;
  const pct = value / max;
  const dash = circumference * pct;
  const color = value > 70 ? "#EF4444" : value > 40 ? "#F59E0B" : "#22C55E";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size / 2 + 10} viewBox="0 0 100 60">
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="50" y="48" textAnchor="middle" fill="#F1F5F9" fontSize="18" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
          {value}%
        </text>
      </svg>
      <span style={{ fontSize: 11, color: "#94A3B8" }}>{label}</span>
    </div>
  );
}

// --- KPI Card ---
function KpiCard({ label, value, prev, period, sparkData, color = "#2563EB", delay = 0, loading = false }: { label: string; value: number; prev: number; period: string; sparkData: TrendPoint[]; color?: string; delay?: number; loading?: boolean }) {
  const delta = prev ? ((value - prev) / prev * 100).toFixed(1) : null;
  const isUp = delta !== null && Number(delta) > 0;

  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div style={{
      background: "#0F172A",
      border: "1px solid #1E293B",
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      animation: `fadeSlideUp 0.5s ${delay}s both`,
      position: "relative",
      overflow: "hidden",
    }}>
      {loading ? <SkeletonBlock /> : null}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", opacity: loading ? 0 : 1 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "#F1F5F9",
              lineHeight: 1.1,
              marginTop: 6,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {fmt(value)}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{period}</div>
        </div>
        <Sparkline data={sparkData.slice(-14)} color={color} width={100} height={40} />
      </div>
      {delta !== null && !loading ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: isUp ? "#22C55E" : "#EF4444",
            marginTop: 2,
          }}
        >
          <span>{isUp ? "▲" : "▼"}</span>
          <span>{Math.abs(Number(delta))}%</span>
          <span style={{ color: "#64748B", fontWeight: 400 }}>vs prev period</span>
        </div>
      ) : null}
    </div>
  );
}

// --- Card Wrapper ---
function Card({ title, children, style = {}, delay = 0, loading = false }: { title?: string; children: React.ReactNode; style?: CSSProperties; delay?: number; loading?: boolean }) {
  return (
    <div
      style={{
        background: "#0F172A",
        border: "1px solid #1E293B",
        borderRadius: 12,
        padding: "20px 24px",
        animation: `fadeSlideUp 0.5s ${delay}s both`,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {loading ? <SkeletonBlock /> : null}
      {title ? (
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, opacity: loading ? 0 : 1 }}>
          {title}
        </div>
      ) : null}
      <div style={{ opacity: loading ? 0 : 1 }}>{children}</div>
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, rgba(30,41,59,0.4) 0%, rgba(51,65,85,0.7) 50%, rgba(30,41,59,0.4) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s linear infinite",
      }}
    />
  );
}

// --- Table Row ---
function TableRow({ label, value, maxValue, index }: { label: string; value: number; maxValue: number; index: number }) {
  const pct = maxValue ? (value / maxValue) * 100 : 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid #1E293B",
        animation: `fadeSlideUp 0.3s ${0.1 * index}s both`,
      }}
    >
      <span style={{ fontSize: 13, color: "#CBD5E1", flex: 1, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
      <div style={{ width: 80, height: 4, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "#2563EB",
            borderRadius: 2,
            transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#F1F5F9",
          minWidth: 48,
          textAlign: "right",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
      </span>
    </div>
  );
}

// --- Status Dot ---
function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: active ? "#22C55E" : "#64748B",
        display: "inline-block",
        boxShadow: active ? "0 0 8px #22C55E60" : "none",
        animation: active ? "pulse 2s infinite" : "none",
      }}
    />
  );
}

async function fetchJson<T>(path: string, secret: string, range?: string): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("secret", secret);
  if (range) url.searchParams.set("range", range);
  if (path.endsWith("/recent")) url.searchParams.set("limit", "20");

  const response = await fetch(url.toString(), {
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    const error = new Error("forbidden");
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<number | null>(null);
  const [kpis, setKpis] = useState<KpisResponse>(emptyKpis());
  const [trends, setTrends] = useState<TrendsResponse>(emptyTrends());
  const [breakdowns, setBreakdowns] = useState<BreakdownResponse>(emptyBreakdowns());
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const searchParams = useSearchParams();
  const secret = searchParams.get("secret") || "";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!API_BASE) {
        setLoading(false);
        setError("NEXT_PUBLIC_API_URL is not configured.");
        return;
      }
      if (!secret) {
        setLoading(false);
        setAuthError(403);
        return;
      }

      setLoading(true);
      setError(null);
      setAuthError(null);

      try {
        const [kpiData, trendData, breakdownData, recentData] = await Promise.all([
          fetchJson<KpisResponse>("/api/admin/kpis", secret, timeRange),
          fetchJson<TrendsResponse>("/api/admin/trends", secret, timeRange),
          fetchJson<BreakdownResponse>("/api/admin/breakdowns", secret, timeRange),
          fetchJson<{ items: RecentItem[] }>("/api/admin/recent", secret),
        ]);

        if (cancelled) return;
        setKpis(kpiData);
        setTrends(trendData);
        setBreakdowns(breakdownData);
        setRecent(recentData.items || []);
      } catch (err) {
        if (cancelled) return;
        const status = (err as Error & { status?: number }).status;
        if (status === 401 || status === 403) {
          setAuthError(status);
        } else {
          setError("Dashboard data could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const refresh = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, [secret, timeRange]);

  const accountCategories = useMemo(() => {
    return breakdowns.account_categories.map((item) => ({
      ...item,
      color: item.color || (item.label === "Non-followers" ? "#EF4444" : item.label === "Mutuals" ? "#22C55E" : "#F59E0B"),
    }));
  }, [breakdowns.account_categories]);

  const content = authError ? (
    <Card title="Access denied" style={{ marginTop: 24 }}>
      <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>
        The admin API rejected this request with {authError}. Open the page with a valid secret, for example:
        <div style={{ marginTop: 10, color: "#60A5FA", fontFamily: "'JetBrains Mono', monospace" }}>/admin?secret=your-admin-secret</div>
      </div>
    </Card>
  ) : error ? (
    <Card title="Dashboard error" style={{ marginTop: 24 }}>
      <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>{error}</div>
    </Card>
  ) : (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
        className="admin-grid-4"
      >
        <KpiCard label="Analyses" value={kpis.analyses.current} prev={kpis.analyses.previous} period={kpis.analyses.period} sparkData={trends.analyses.current} color="#2563EB" delay={0} loading={loading} />
        <KpiCard label="Page Views" value={kpis.page_views.current} prev={kpis.page_views.previous} period={kpis.page_views.period} sparkData={trends.page_views.current} color="#8B5CF6" delay={0.05} loading={loading} />
        <KpiCard label="Unique Users" value={kpis.unique_users.current} prev={kpis.unique_users.previous} period={kpis.unique_users.period} sparkData={trends.page_views.current} color="#22C55E" delay={0.1} loading={loading} />
        <KpiCard label="AI Classifications" value={kpis.ai_classifications.current} prev={kpis.ai_classifications.previous} period={kpis.ai_classifications.period} sparkData={trends.analyses.current} color="#F59E0B" delay={0.15} loading={loading} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="admin-grid-2">
        <Card title="Analyses — trend" delay={0.2} loading={loading}>
          <TrendChart current={trends.analyses.current} previous={trends.analyses.previous} color="#2563EB" />
        </Card>
        <Card title="Page Views — trend" delay={0.25} loading={loading}>
          <TrendChart current={trends.page_views.current} previous={trends.page_views.previous} color="#8B5CF6" />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }} className="admin-grid-3">
        <Card title="Export Format Split" delay={0.3} loading={loading}>
          <MiniBarChart data={breakdowns.export_formats} height={110} />
        </Card>

        <Card title="Account Breakdown (avg)" delay={0.35} loading={loading}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <DonutChart data={accountCategories} size={110} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {accountCategories.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, display: "inline-block" }} />
                  <span style={{ color: "#CBD5E1" }}>{c.label}</span>
                  <span style={{ color: "#64748B", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Engagement" delay={0.4} loading={loading}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9", fontFamily: "'JetBrains Mono', monospace" }}>{breakdowns.engagement.avg_session_duration}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Avg session</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9", fontFamily: "'JetBrains Mono', monospace" }}>{breakdowns.engagement.pages_per_session}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Pages / session</div>
            </div>
            <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
              <Gauge value={breakdowns.engagement.bounce_rate} label="Bounce rate" size={120} />
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 16 }} className="admin-grid-bottom">
        <Card title="by source" delay={0.45} loading={loading}>
          {(breakdowns.traffic_sources.length ? breakdowns.traffic_sources : [{ label: "direct", value: 0 }]).map((t, i, arr) => (
            <TableRow key={i} label={t.label} value={t.value} maxValue={arr[0]?.value || 1} index={i} />
          ))}
        </Card>

        <Card title="Top pages" delay={0.5} loading={loading}>
          {(breakdowns.top_pages.length ? breakdowns.top_pages : [{ path: "/", views: 0 }]).map((p, i, arr) => (
            <TableRow key={i} label={p.path} value={p.views} maxValue={arr[0]?.views || 1} index={i} />
          ))}
        </Card>

        <Card title="Recent Analyses — Live Feed" delay={0.55} loading={loading}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(recent.length ? recent : [{ id: 0, relative_time: "—", metadata: {} }]).map((a, i) => (
              <div
                key={a.id || i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 1fr 60px 50px",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid #1E293B",
                  fontSize: 13,
                  animation: `fadeSlideUp 0.3s ${0.1 * i}s both`,
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#64748B", fontSize: 11 }}>{a.relative_time}</span>
                <span style={{ color: "#CBD5E1", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                  {(a.metadata.accounts_count || 0).toLocaleString()} <span style={{ color: "#64748B", fontWeight: 400, fontSize: 11 }}>accts</span>
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ color: "#EF4444", fontWeight: 600 }}>{a.metadata.non_followers || 0}</span>
                  <span style={{ color: "#64748B", fontSize: 11 }}> non-followers</span>
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: String(a.metadata.export_format || "").toUpperCase() === "HTML" ? "#1E3A5F" : "#1E293B",
                    color: String(a.metadata.export_format || "").toUpperCase() === "HTML" ? "#60A5FA" : "#94A3B8",
                  }}
                >
                  {String(a.metadata.export_format || "—").toUpperCase()}
                </span>
                <span style={{ textAlign: "center" }}>
                  {a.metadata.ai_used ? (
                    <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "#1C2D1E", color: "#22C55E", fontWeight: 600 }}>AI</span>
                  ) : (
                    <span style={{ fontSize: 11, color: "#475569" }}>—</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background: "linear-gradient(135deg, #0F172A, #1E293B)",
              borderRadius: 8,
              border: "1px solid #1E293B",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "#94A3B8" }}>Avg accounts per analysis</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#2563EB", fontFamily: "'JetBrains Mono', monospace" }}>
              {breakdowns.engagement.avg_accounts_processed}
            </span>
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#F1F5F9",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;600;700;800&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0F172A; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

        @media (max-width: 1200px) {
          .admin-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-grid-3 { grid-template-columns: 1fr !important; }
          .admin-grid-bottom { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 900px) {
          .admin-grid-2 { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 720px) {
          .admin-grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <header
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid #1E293B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#0F172A",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "white",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            U
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Unfollowr</div>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Admin Analytics</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94A3B8" }}>
            <StatusDot active={!loading} />
            <span>{loading ? "Loading" : "Live"}</span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {now.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div style={{ display: "flex", background: "#1E293B", borderRadius: 8, overflow: "hidden" }}>
            {["24h", "7d", "28d"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: "6px 14px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  background: timeRange === r ? "#2563EB" : "transparent",
                  color: timeRange === r ? "white" : "#94A3B8",
                  transition: "all 0.2s",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", maxWidth: 1440, margin: "0 auto" }}>
        {content}

        <div
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: "1px solid #1E293B",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "#475569",
          }}
        >
          <span>Unfollowr Admin Dashboard</span>
          <span>Data refreshes every 60s · PostgreSQL-backed</span>
        </div>
      </main>
    </div>
  );
}
