import { useState } from "react";
import { ArrowLeft, Users, UserMinus, UserPlus, Heart, TrendingUp, AlertCircle, Sparkles, Instagram, CheckCircle2, Search, ExternalLink } from "lucide-react";

const tokens = {
  bg: "#FAFBFC",
  surface: "#FFFFFF",
  surface2: "#F5F7FA",
  text: "#111827",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  primarySoft: "rgba(37,99,235,0.08)",
  success: "#059669",
  successSoft: "rgba(5,150,105,0.08)",
  warning: "#D97706",
  warningSoft: "rgba(217,119,6,0.08)",
  purple: "#7C3AED",
  purpleSoft: "rgba(124,58,237,0.07)",
};

const mockAccounts = [
  { username: "taylorswift", displayName: "Taylor Swift", verified: true, category: "Celebrity", suggestionScore: 15 },
  { username: "nike", displayName: "Nike", verified: true, category: "Brand", suggestionScore: 10 },
  { username: "natgeo", displayName: "National Geographic", verified: true, category: "Media", suggestionScore: 20 },
  { username: "johnsmith_inactive", displayName: "John Smith", category: "Personal", suggestionScore: 95 },
  { username: "chrismartinez", displayName: "Chris Martinez", category: "Personal", suggestionScore: 85 },
  { username: "jessicagarcia", displayName: "Jessica Garcia", category: "Personal", suggestionScore: 78 },
  { username: "davidlee", displayName: "David Lee", category: "Personal", suggestionScore: 72 },
  { username: "rachelanderson", displayName: "Rachel Anderson", category: "Personal", suggestionScore: 65 },
];

const mockFans = [
  { username: "lisawhite", displayName: "Lisa White" },
  { username: "tomjohnson", displayName: "Tom Johnson" },
  { username: "amythompson", displayName: "Amy Thompson" },
];

const mockMutuals = [
  { username: "sarahjones", displayName: "Sarah Jones" },
  { username: "mikebrown", displayName: "Mike Brown" },
  { username: "emilydavis", displayName: "Emily Davis" },
  { username: "alexwilson", displayName: "Alex Wilson" },
];

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState("non-followers");
  const [search, setSearch] = useState("");

  const stats = {
    following: 12, followers: 7, nonFollowers: mockAccounts.length,
    fans: mockFans.length, mutuals: mockMutuals.length,
  };

  const currentAccounts = activeTab === "non-followers" ? mockAccounts
    : activeTab === "fans" ? mockFans : mockMutuals;

  const filtered = currentAccounts.filter(a =>
    a.username.toLowerCase().includes(search.toLowerCase()) ||
    a.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 80) return tokens.success;
    if (score >= 50) return tokens.warning;
    return tokens.textFaint;
  };

  const tabBanners = {
    "non-followers": {
      bg: tokens.warningSoft, border: "rgba(217,119,6,0.15)", icon: AlertCircle, iconColor: tokens.warning,
      text: "These accounts you follow don't follow you back. Higher suggestion scores indicate safer unfollows — we exclude celebrities, brands, and verified accounts.",
    },
    fans: {
      bg: tokens.successSoft, border: "rgba(5,150,105,0.15)", icon: Heart, iconColor: tokens.success,
      text: "These accounts follow you, but you don't follow them back. Consider following them if you recognize them!",
    },
    mutuals: {
      bg: tokens.primarySoft, border: "rgba(37,99,235,0.15)", icon: TrendingUp, iconColor: tokens.primary,
      text: "Your mutual connections — accounts that both follow you and you follow back. These are your engaged audience!",
    },
  };

  const banner = tabBanners[activeTab];

  return (
    <div style={{ background: tokens.bg, color: tokens.text, minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .stat-card {
          border-radius: 14px; padding: 18px 20px; transition: all 0.15s;
        }
        .stat-card:hover { transform: translateY(-1px); }

        .tab-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; border: none; background: none;
          font-family: inherit; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          border-bottom: 2px solid transparent; color: ${tokens.textMuted};
        }
        .tab-btn:hover { color: ${tokens.text}; }
        .tab-btn.active { color: ${tokens.text}; border-bottom-color: ${tokens.primary}; }

        .tab-count {
          font-size: 12px; padding: 2px 8px; border-radius: 99px;
          font-weight: 600; transition: all 0.15s;
        }
        .tab-count.active { background: ${tokens.primary}; color: white; }
        .tab-count.inactive { background: ${tokens.surface2}; color: ${tokens.textMuted}; }

        .account-row {
          background: ${tokens.surface}; border: 1px solid ${tokens.border};
          border-radius: 12px; padding: 16px 20px;
          display: flex; align-items: center; gap: 16px;
          transition: all 0.15s; cursor: default;
        }
        .account-row:hover { background: ${tokens.surface2}; border-color: ${tokens.borderStrong}; }

        .avatar {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 17px; color: white;
          background: linear-gradient(135deg, #2563EB, #60A5FA);
        }

        .category-chip {
          display: inline-flex; font-size: 11px; font-weight: 600;
          padding: 3px 9px; border-radius: 6px;
          background: ${tokens.surface2}; color: ${tokens.textMuted};
          letter-spacing: 0.02em;
        }

        .score-bar-bg {
          width: 72px; height: 5px; border-radius: 99px;
          background: ${tokens.surface2}; overflow: hidden;
        }
        .score-bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }

        .ig-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 10px; border: none;
          background: ${tokens.surface2}; color: ${tokens.textMuted};
          cursor: pointer; transition: all 0.15s; flex-shrink: 0;
          text-decoration: none;
        }
        .ig-btn:hover { background: ${tokens.primarySoft}; color: ${tokens.primary}; }

        .search-wrap {
          position: relative; width: 100%; max-width: 320px;
        }
        .search-wrap input {
          width: 100%; height: 40px; border-radius: 10px;
          border: 1.5px solid ${tokens.border}; background: ${tokens.surface};
          padding: 0 14px 0 38px; font-size: 14px; font-family: inherit;
          color: ${tokens.text}; outline: none; transition: all 0.15s;
        }
        .search-wrap input::placeholder { color: ${tokens.textFaint}; }
        .search-wrap input:focus { border-color: ${tokens.primary}; box-shadow: 0 0 0 3px ${tokens.primarySoft}; }
        .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }

        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: ${tokens.textMuted}; text-decoration: none; font-size: 14px;
          font-weight: 500; transition: color 0.15s; cursor: pointer;
          border: none; background: none; font-family: inherit;
        }
        .back-link:hover { color: ${tokens.text}; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .account-row { padding: 12px 14px; gap: 12px; }
          .score-section { display: none !important; }
          .tabs-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: tokens.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>U</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>Unfollowr</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 64px" }}>
        {/* ═══ BACK ═══ */}
        <button className="back-link" style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Upload new file
        </button>

        {/* ═══ TITLE ═══ */}
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24 }}>
          Your Instagram Insights
        </h1>

        {/* ═══ STATS ═══ */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { icon: Users, label: "Following", value: stats.following, bg: tokens.surface2, color: tokens.text },
            { icon: Heart, label: "Followers", value: stats.followers, bg: tokens.surface2, color: tokens.text },
            { icon: UserMinus, label: "Don't follow back", value: stats.nonFollowers, bg: tokens.warningSoft, color: tokens.warning },
            { icon: UserPlus, label: "Your fans", value: stats.fans, bg: tokens.successSoft, color: tokens.success },
            { icon: TrendingUp, label: "Mutuals", value: stats.mutuals, bg: tokens.primarySoft, color: tokens.primary },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ background: s.bg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, opacity: 0.8 }}>
                <s.icon size={16} color={s.color} />
                <span style={{ fontSize: 13, color: s.color, fontWeight: 500 }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ AI INSIGHTS BANNER ═══ */}
        <div style={{
          background: `linear-gradient(135deg, ${tokens.purpleSoft}, ${tokens.primarySoft})`,
          border: `1px solid rgba(124,58,237,0.12)`,
          borderRadius: 14, padding: "16px 20px", marginBottom: 32,
          display: "flex", alignItems: "flex-start", gap: 14,
        }}>
          <Sparkles size={18} color={tokens.purple} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>AI-Powered Insights</p>
            <p style={{ fontSize: 13, color: tokens.textMuted, lineHeight: "20px" }}>
              Accounts are analyzed with smart suggestion scores. We won't recommend unfollowing celebrities, brands, or verified accounts — only inactive or non-mutual personal accounts.
            </p>
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="tabs-row" style={{ borderBottom: `1.5px solid ${tokens.border}`, marginBottom: 20, display: "flex", gap: 4 }}>
          {[
            { key: "non-followers", icon: UserMinus, label: "Don't follow back", count: stats.nonFollowers },
            { key: "fans", icon: UserPlus, label: "Your fans", count: stats.fans },
            { key: "mutuals", icon: TrendingUp, label: "Mutuals", count: stats.mutuals },
          ].map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
              <span className={`tab-count ${activeTab === tab.key ? "active" : "inactive"}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ═══ SEARCH ═══ */}
        <div style={{ marginBottom: 16 }}>
          <div className="search-wrap">
            <Search size={16} color={tokens.textFaint} />
            <input
              type="text"
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ═══ CONTEXT BANNER ═══ */}
        <div style={{
          background: banner.bg, border: `1px solid ${banner.border}`,
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <banner.icon size={17} color={banner.iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: tokens.textMuted, lineHeight: "20px" }}>{banner.text}</p>
        </div>

        {/* ═══ ACCOUNT LIST ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: tokens.textMuted, marginBottom: 4 }}>No accounts found</p>
              <p style={{ fontSize: 13, color: tokens.textFaint }}>Try adjusting your search</p>
            </div>
          ) : (
            filtered.map((account, i) => (
              <div key={i} className="account-row">
                {/* Avatar */}
                <div className="avatar">
                  {account.username[0].toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{account.displayName}</span>
                    {account.verified && <CheckCircle2 size={15} color={tokens.primary} />}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: tokens.textMuted }}>@{account.username}</span>
                    {account.category && (
                      <span className="category-chip">{account.category}</span>
                    )}
                  </div>
                </div>

                {/* Suggestion score */}
                {activeTab === "non-followers" && account.suggestionScore !== undefined && (
                  <div className="score-section" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 11, color: tokens.textFaint }}>Unfollow score</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: getScoreColor(account.suggestionScore), letterSpacing: "-0.02em" }}>
                        {account.suggestionScore}%
                      </span>
                    </div>
                    <div className="score-bar-bg">
                      <div className="score-bar-fill" style={{ width: `${account.suggestionScore}%`, background: getScoreColor(account.suggestionScore) }} />
                    </div>
                  </div>
                )}

                {/* Instagram link */}
                <a
                  className="ig-btn"
                  href={`https://instagram.com/${account.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Instagram"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
