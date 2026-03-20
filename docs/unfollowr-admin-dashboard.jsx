import { useState, useEffect, useRef, useMemo } from "react";

// --- Mock Data Generator ---
const generateDailyData = (days, baseMin, baseMax, trend = 0) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = baseMin + Math.random() * (baseMax - baseMin);
    const trendVal = trend * (days - i) / days;
    const weekday = d.getDay();
    const weekendDip = (weekday === 0 || weekday === 6) ? 0.6 : 1;
    data.push({
      date: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round((base + trendVal) * weekendDip),
    });
  }
  return data;
};

const ANALYSES_28D = generateDailyData(28, 30, 80, 20);
const PAGEVIEWS_28D = generateDailyData(28, 800, 2200, 400);
const USERS_28D = generateDailyData(28, 200, 600, 100);
const AI_CLASS_28D = generateDailyData(28, 8, 35, 10);

const sum = (arr) => arr.reduce((a, b) => a + b.value, 0);
const avg = (arr) => Math.round(sum(arr) / arr.length);

const KPI_DATA = {
  analyses: { current: sum(ANALYSES_28D.slice(-7)), prev: sum(ANALYSES_28D.slice(-14, -7)), label: "Analyses", period: "past 7 days" },
  pageviews: { current: sum(PAGEVIEWS_28D.slice(-7)), prev: sum(PAGEVIEWS_28D.slice(-14, -7)), label: "Page Views", period: "past 7 days" },
  users: { current: sum(USERS_28D.slice(-7)), prev: sum(USERS_28D.slice(-14, -7)), label: "Unique Users", period: "past 7 days" },
  aiClassifications: { current: sum(AI_CLASS_28D.slice(-7)), prev: sum(AI_CLASS_28D.slice(-14, -7)), label: "AI Classifications", period: "past 7 days" },
};

const EXPORT_FORMAT = [
  { label: "HTML Export", value: 64, color: "#2563EB" },
  { label: "JSON Export", value: 36, color: "#60A5FA" },
];

const TRAFFIC_SOURCES = [
  { label: "organic", value: 4821 },
  { label: "direct", value: 2190 },
  { label: "referral", value: 1456 },
  { label: "social", value: 893 },
  { label: "cpc", value: 312 },
];

const ACCOUNT_CATEGORIES = [
  { label: "Non-followers", value: 42, color: "#EF4444" },
  { label: "Mutuals", value: 38, color: "#22C55E" },
  { label: "Fans", value: 20, color: "#F59E0B" },
];

const ENGAGEMENT = {
  avgSessionDuration: "1m 47s",
  pagesPerSession: 2.3,
  bounceRate: 61.2,
  avgAccountsProcessed: 847,
};

const TOP_PAGES = [
  { path: "/", views: 5120 },
  { path: "/upload", views: 3845 },
  { path: "/results", views: 2930 },
  { path: "/about", views: 412 },
  { path: "/privacy", views: 189 },
];

const RECENT_ANALYSES = [
  { time: "2 min ago", accounts: 1243, nonFollowers: 312, format: "HTML", aiUsed: true },
  { time: "8 min ago", accounts: 567, nonFollowers: 89, format: "JSON", aiUsed: false },
  { time: "14 min ago", accounts: 2891, nonFollowers: 741, format: "HTML", aiUsed: true },
  { time: "21 min ago", accounts: 389, nonFollowers: 52, format: "HTML", aiUsed: false },
  { time: "33 min ago", accounts: 1820, nonFollowers: 445, format: "JSON", aiUsed: true },
  { time: "45 min ago", accounts: 956, nonFollowers: 201, format: "HTML", aiUsed: false },
];

// --- Sparkline Component ---
function Sparkline({ data, width = 180, height = 48, color = "#2563EB", showArea = true }) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const areaPoints = [
    `${pad},${height}`,
    ...points,
    `${width - pad},${height}`,
  ].join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {showArea && (
        <polygon points={areaPoints} fill={color} opacity="0.1" />
      )}
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
function MiniBarChart({ data, height = 120 }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 6 }}>
          <span style={{ fontSize: 11, color: "#94A3B8", fontVariantNumeric: "tabular-nums" }}>{d.value}%</span>
          <div
            style={{
              width: "100%",
              maxWidth: 48,
              height: `${(d.value / maxVal) * (height - 32)}px`,
              background: d.color,
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
function DonutChart({ data, size = 120 }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
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
              stroke={d.color}
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
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", fontFamily: "'JetBrains Mono', monospace" }}>{total}%</span>
      </div>
    </div>
  );
}

// --- Trend Line Chart ---
function TrendChart({ current, previous, width = "100%", height = 160, color = "#2563EB", prevColor = "#475569" }) {
  const svgRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(400);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setSvgWidth(entry.contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const drawLine = (data, w, h) => {
    const vals = data.map((d) => d.value);
    const min = Math.min(...vals, ...previous.map((d) => d.value));
    const max = Math.max(...vals, ...previous.map((d) => d.value));
    const range = max - min || 1;
    const pad = 4;
    return vals
      .map((v, i) => {
        const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2 - 20) - 10;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const labels = current.filter((_, i) => i % 7 === 0).map((d) => d.label);

  return (
    <div style={{ width, position: "relative" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 11, color: "#94A3B8" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
          past 28 days
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: prevColor, display: "inline-block" }} />
          prev 28 days
        </span>
      </div>
      <svg ref={svgRef} width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`} preserveAspectRatio="none">
        <polyline points={drawLine(previous, svgWidth, height)} fill="none" stroke={prevColor} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <polyline points={drawLine(current, svgWidth, height)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748B", marginTop: 4, padding: "0 4px" }}>
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

// --- Gauge ---
function Gauge({ value, max = 100, label, size = 100 }) {
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
function KpiCard({ label, value, prev, period, sparkData, color = "#2563EB", delay = 0 }) {
  const delta = prev ? ((value - prev) / prev * 100).toFixed(1) : null;
  const isUp = delta > 0;

  const fmt = (n) => {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
          <div style={{
            fontSize: 36, fontWeight: 800, color: "#F1F5F9", lineHeight: 1.1, marginTop: 6,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{fmt(value)}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{period}</div>
        </div>
        {sparkData && <Sparkline data={sparkData.slice(-14)} color={color} width={100} height={40} />}
      </div>
      {delta !== null && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, fontWeight: 600,
          color: isUp ? "#22C55E" : "#EF4444",
          marginTop: 2,
        }}>
          <span>{isUp ? "▲" : "▼"}</span>
          <span>{Math.abs(delta)}%</span>
          <span style={{ color: "#64748B", fontWeight: 400 }}>vs prev period</span>
        </div>
      )}
    </div>
  );
}

// --- Card Wrapper ---
function Card({ title, children, style = {}, delay = 0 }) {
  return (
    <div style={{
      background: "#0F172A",
      border: "1px solid #1E293B",
      borderRadius: 12,
      padding: "20px 24px",
      animation: `fadeSlideUp 0.5s ${delay}s both`,
      ...style,
    }}>
      {title && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// --- Table Row ---
function TableRow({ label, value, maxValue, index }) {
  const pct = (value / maxValue) * 100;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "8px 0",
      borderBottom: "1px solid #1E293B",
      animation: `fadeSlideUp 0.3s ${0.1 * index}s both`,
    }}>
      <span style={{ fontSize: 13, color: "#CBD5E1", flex: 1, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
      <div style={{ width: 80, height: 4, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: "#2563EB", borderRadius: 2,
          transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }} />
      </div>
      <span style={{
        fontSize: 13, fontWeight: 600, color: "#F1F5F9", minWidth: 48, textAlign: "right",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
      </span>
    </div>
  );
}

// --- Status Dot ---
function StatusDot({ active }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%",
      background: active ? "#22C55E" : "#64748B",
      display: "inline-block",
      boxShadow: active ? "0 0 8px #22C55E60" : "none",
      animation: active ? "pulse 2s infinite" : "none",
    }} />
  );
}

// --- Main Dashboard ---
export default function UnfollowrDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const prevAnalyses28 = generateDailyData(28, 20, 60, 10);
  const prevPageviews28 = generateDailyData(28, 600, 1800, 200);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      color: "#F1F5F9",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
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
      `}</style>

      {/* Header */}
      <header style={{
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
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, color: "white",
            fontFamily: "'JetBrains Mono', monospace",
          }}>U</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Unfollowr</div>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Admin Analytics</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94A3B8" }}>
            <StatusDot active />
            <span>Live</span>
          </div>
          <div style={{
            fontSize: 13, color: "#94A3B8",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
          }}>
            {now.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div style={{ display: "flex", background: "#1E293B", borderRadius: 8, overflow: "hidden" }}>
            {["24h", "7d", "28d"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: "6px 14px", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
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

      {/* Content */}
      <main style={{ padding: "24px 32px", maxWidth: 1440, margin: "0 auto" }}>

        {/* KPI Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}>
          <KpiCard label="Analyses" value={KPI_DATA.analyses.current} prev={KPI_DATA.analyses.prev} period={KPI_DATA.analyses.period} sparkData={ANALYSES_28D} color="#2563EB" delay={0} />
          <KpiCard label="Page Views" value={KPI_DATA.pageviews.current} prev={KPI_DATA.pageviews.prev} period={KPI_DATA.pageviews.period} sparkData={PAGEVIEWS_28D} color="#8B5CF6" delay={0.05} />
          <KpiCard label="Unique Users" value={KPI_DATA.users.current} prev={KPI_DATA.users.prev} period={KPI_DATA.users.period} sparkData={USERS_28D} color="#22C55E" delay={0.1} />
          <KpiCard label="AI Classifications" value={KPI_DATA.aiClassifications.current} prev={KPI_DATA.aiClassifications.prev} period={KPI_DATA.aiClassifications.period} sparkData={AI_CLASS_28D} color="#F59E0B" delay={0.15} />
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <Card title="Analyses — 28 day trend" delay={0.2}>
            <TrendChart current={ANALYSES_28D} previous={prevAnalyses28} color="#2563EB" />
          </Card>
          <Card title="Page Views — 28 day trend" delay={0.25}>
            <TrendChart current={PAGEVIEWS_28D} previous={prevPageviews28} color="#8B5CF6" />
          </Card>
        </div>

        {/* Middle Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Export Formats */}
          <Card title="Export Format Split" delay={0.3}>
            <MiniBarChart data={EXPORT_FORMAT} height={110} />
          </Card>

          {/* Account Categories */}
          <Card title="Account Breakdown (avg)" delay={0.35}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <DonutChart data={ACCOUNT_CATEGORIES} size={110} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ACCOUNT_CATEGORIES.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, display: "inline-block" }} />
                    <span style={{ color: "#CBD5E1" }}>{c.label}</span>
                    <span style={{ color: "#64748B", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Engagement */}
          <Card title="Engagement" delay={0.4}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9", fontFamily: "'JetBrains Mono', monospace" }}>
                  {ENGAGEMENT.avgSessionDuration}
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Avg session</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9", fontFamily: "'JetBrains Mono', monospace" }}>
                  {ENGAGEMENT.pagesPerSession}
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Pages / session</div>
              </div>
              <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
                <Gauge value={ENGAGEMENT.bounceRate} label="Bounce rate" size={120} />
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 16 }}>
          {/* Traffic Sources */}
          <Card title="by source" delay={0.45}>
            {TRAFFIC_SOURCES.map((t, i) => (
              <TableRow key={i} label={t.label} value={t.value} maxValue={TRAFFIC_SOURCES[0].value} index={i} />
            ))}
          </Card>

          {/* Top Pages */}
          <Card title="Top pages" delay={0.5}>
            {TOP_PAGES.map((p, i) => (
              <TableRow key={i} label={p.path} value={p.views} maxValue={TOP_PAGES[0].views} index={i} />
            ))}
          </Card>

          {/* Recent Analyses Feed */}
          <Card title="Recent Analyses — Live Feed" delay={0.55}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {RECENT_ANALYSES.map((a, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 1fr 60px 50px",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid #1E293B",
                  fontSize: 13,
                  animation: `fadeSlideUp 0.3s ${0.1 * i}s both`,
                  alignItems: "center",
                }}>
                  <span style={{ color: "#64748B", fontSize: 11 }}>{a.time}</span>
                  <span style={{ color: "#CBD5E1", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    {a.accounts.toLocaleString()} <span style={{ color: "#64748B", fontWeight: 400, fontSize: 11 }}>accts</span>
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ color: "#EF4444", fontWeight: 600 }}>{a.nonFollowers}</span>
                    <span style={{ color: "#64748B", fontSize: 11 }}> non-followers</span>
                  </span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: a.format === "HTML" ? "#1E3A5F" : "#1E293B",
                    color: a.format === "HTML" ? "#60A5FA" : "#94A3B8",
                  }}>
                    {a.format}
                  </span>
                  <span style={{ textAlign: "center" }}>
                    {a.aiUsed ? (
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "#1C2D1E", color: "#22C55E", fontWeight: 600 }}>AI</span>
                    ) : (
                      <span style={{ fontSize: 11, color: "#475569" }}>—</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {/* Avg accounts processed */}
            <div style={{
              marginTop: 16, padding: "12px 16px",
              background: "linear-gradient(135deg, #0F172A, #1E293B)",
              borderRadius: 8, border: "1px solid #1E293B",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>Avg accounts per analysis</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#2563EB", fontFamily: "'JetBrains Mono', monospace" }}>
                {ENGAGEMENT.avgAccountsProcessed}
              </span>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 32, paddingTop: 16, borderTop: "1px solid #1E293B",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 11, color: "#475569",
        }}>
          <span>Unfollowr Admin Dashboard</span>
          <span>Data refreshes every 60s · Mock data for preview</span>
        </div>
      </main>
    </div>
  );
}
