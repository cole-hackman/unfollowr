"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlphaChips } from "@/components/results/AlphaChips";
import { SelectionBar } from "@/components/results/SelectionBar";
import { UserCard } from "@/components/results/UserCard";
import { EmptyState } from "@/components/results/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Users,
  UserMinus,
  UserPlus,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Heart,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";

type Item = { username: string; score?: number; tags?: string[]; customTags?: string[]; unfollowed?: boolean };

type TabKey = "don't follow back" | "fans" | "mutuals";

function readStableCounts(): { following: number; followers: number; nonfollowers: number; fans: number; mutuals: number } {
  try {
    const sraw = sessionStorage.getItem("unfollowr-stats");
    const raw = sessionStorage.getItem("unfollowr-items");
    const rraw = sessionStorage.getItem("unfollowr-items-reverse");
    const stats = sraw ? JSON.parse(sraw) : { followers: 0, following: 0 };
    const following = stats.following ?? 0;
    const followers = stats.followers ?? 0;
    const nonfollowers = raw ? (JSON.parse(raw) as Item[]).length : 0;
    const fans = rraw ? (JSON.parse(rraw) as Item[]).length : 0;
    const mutuals = Math.max(following - nonfollowers, 0);
    return { following, followers, nonfollowers, fans, mutuals };
  } catch {
    return { following: 0, followers: 0, nonfollowers: 0, fans: 0, mutuals: 0 };
  }
}

export default function ResultsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [alpha, setAlpha] = useState("All");
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("don't follow back");
  const [view, setView] = useState<string>(() => {
    if (typeof window === "undefined") return "list";
    const stored = localStorage.getItem("unfollowr-view");
    return stored === "list" || stored === "grid2" || stored === "grid3" ? stored : "list";
  });
  const [stableCounts, setStableCounts] = useState(() => ({ following: 0, followers: 0, nonfollowers: 0, fans: 0, mutuals: 0 }));
  const [hideUnfollowed, setHideUnfollowed] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; usernames: string[] }>({ open: false, usernames: [] });
  const [toast, setToast] = useState<{ show: boolean; count: number; usernames: string[]; timer?: number }>({ show: false, count: 0, usernames: [] });

  // Load data and stable counts from sessionStorage; keep counts stable when switching tabs
  useEffect(() => {
    setStableCounts(readStableCounts());
    try {
      const raw = sessionStorage.getItem("unfollowr-items");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    function onData(e: any) {
      const list = e.detail as Item[];
      setItems(list);
      try { sessionStorage.setItem("unfollowr-items", JSON.stringify(list)); } catch {}
      setStableCounts(readStableCounts());
    }
    window.addEventListener("unfollowr-dataset", onData as any);
    return () => window.removeEventListener("unfollowr-dataset", onData as any);
  }, []);

  useEffect(() => { try { localStorage.setItem("unfollowr-view", view); } catch {} }, [view]);
  useEffect(() => { setMounted(true); }, []);

  // When tab changes, load the correct list from sessionStorage
  useEffect(() => {
    try {
      if (activeTab === "don't follow back") {
        const raw = sessionStorage.getItem("unfollowr-items");
        setItems(raw ? JSON.parse(raw) : []);
      } else if (activeTab === "fans") {
        const rraw = sessionStorage.getItem("unfollowr-items-reverse");
        setItems(rraw ? JSON.parse(rraw) : []);
      } else {
        setItems([]);
      }
    } catch {}
  }, [activeTab]);

  // URL params → state (once)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const letter = params.get("letter");
      const v = params.get("view");
      const t = params.get("tab");
      const q = params.get("q");
      if (letter) setAlpha(letter);
      if (v === "list" || v === "grid2" || v === "grid3") setView(v);
      if (t === "fans" || t === "mutuals") setActiveTab(t);
      else if (t === "don't follow back" || t === "dont-follow-back") setActiveTab("don't follow back");
      if (q) setQuery(q);
    } catch {}
  }, []);

  // state → URL params
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      if (alpha !== "All") params.set("letter", alpha);
      if (view !== "list") params.set("view", view);
      if (query) params.set("q", query);
      if (activeTab !== "don't follow back") params.set("tab", activeTab);
      const search = params.toString();
      const url = search ? `/results?${search}` : "/results";
      window.history.replaceState(null, "", url);
    } catch {}
  }, [alpha, view, query, activeTab]);

  const filtered = useMemo(() => {
    let f = items;
    if (alpha !== "All") {
      f = f.filter(i => (i.username[0] || "").toUpperCase() === alpha);
    }
    if (query) {
      f = f.filter(i => i.username.toLowerCase().includes(query.toLowerCase()));
    }
    if (hideUnfollowed) {
      f = f.filter(i => !i.unfollowed);
    }
    return f;
  }, [items, alpha, query, hideUnfollowed]);

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const processedCount = useMemo(() => items.filter(i => i.unfollowed).length, [items]);

  const gridCols =
    view === "list" ? "grid-cols-1" :
    view === "grid2" ? "grid-cols-1 sm:grid-cols-2" :
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  // Select-all (visible) checkbox state
  const headerSelectRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!headerSelectRef.current) return;
    const total = filtered.length;
    const selectedVisible = filtered.filter(i => selected[i.username]).length;
    headerSelectRef.current.indeterminate = selectedVisible > 0 && selectedVisible < total;
  }, [filtered, selected]);

  function toggle(username: string, v: boolean) {
    setSelected((s) => ({ ...s, [username]: v }));
  }

  function selectVisible(v: boolean) {
    setSelected((s) => {
      const next = { ...s } as Record<string, boolean>;
      for (const i of filtered) next[i.username] = v;
      return next;
    });
  }

  function clearSelection() {
    setSelected({});
  }

  // Open all selected profiles in new tabs/windows.
  // Note: modern browsers may still limit the number of popups allowed per click.
  function openSelectedInWaves() {
    const usernames = Object.keys(selected).filter((k) => selected[k]);
    if (!usernames.length) return;
    usernames.forEach((u) => {
      try {
        window.open(`https://instagram.com/${u}`, "_blank", "noopener,noreferrer");
      } catch {
        // ignore popup failures
      }
    });
  }

  function markSelectedUnfollowed() {
    const usernames = Object.keys(selected).filter(k => selected[k]);
    if (usernames.length >= 3) {
      setConfirm({ open: true, usernames });
      return;
    }
    applyMark(usernames);
  }

  function applyMark(usernames: string[]) {
    const setNames = new Set(usernames);
    setItems(prev => prev.map(i => setNames.has(i.username) ? { ...i, unfollowed: true } : i));
    if (toast.timer) window.clearTimeout(toast.timer);
    const timer = window.setTimeout(() => setToast({ show: false, count: 0, usernames: [] }), 10000);
    setToast({ show: true, count: usernames.length, usernames, timer });
  }

  function undoToast() {
    if (!toast.show) return;
    const setNames = new Set(toast.usernames);
    setItems(prev => prev.map(i => setNames.has(i.username) ? { ...i, unfollowed: false } : i));
    if (toast.timer) window.clearTimeout(toast.timer);
    setToast({ show: false, count: 0, usernames: [] });
  }

  function exportSelectedCSV() {
    const rows = ["Username,Instagram URL"]; // header
    for (const i of items) {
      if (!selected[i.username]) continue;
      const uname = i.username.replace(/"/g, '""');
      const url = `https://instagram.com/${i.username}`;
      rows.push(`${uname},${url}`);
    }
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    a.href = URL.createObjectURL(blob);
    a.download = `unfollowr-export-${yyyy}-${mm}-${dd}.csv`;
    a.click();
  }

  function exportSelectedTXT() {
    const list = items.filter(i => selected[i.username]).map(i => i.username).join("\n");
    const blob = new Blob([list], { type: "text/plain;charset=utf-8;" });
    const a = document.createElement("a");
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    a.href = URL.createObjectURL(blob);
    a.download = `unfollowr-export-${yyyy}-${mm}-${dd}.txt`;
    a.click();
  }

  if (!mounted) return null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Back link */}
      <button
        type="button"
        onClick={() => { window.location.href = "/"; }}
        className="mb-6 inline-flex items-center gap-1.5 border-none bg-transparent text-sm font-medium text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text)]"
      >
        <ArrowLeft size={16} aria-hidden />
        Upload new file
      </button>

      {/* Title */}
      <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[color:var(--text)] mb-6">
        Your Instagram Insights
      </h1>

      {/* Stats row - 5 color-coded cards (stable counts) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <div className="rounded-[14px] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--text-muted)]">
            <Users size={16} className="shrink-0" />
            Following
          </div>
          <div className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--text)]">{stableCounts.following}</div>
        </div>
        <div className="rounded-[14px] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--text-muted)]">
            <Heart size={16} className="shrink-0" />
            Followers
          </div>
          <div className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--text)]">{stableCounts.followers}</div>
        </div>
        <div className="rounded-[14px] border border-[color:var(--warning-soft)] bg-[color:var(--warning-soft)] p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--warning)]">
            <UserMinus size={16} className="shrink-0" />
            Don&apos;t follow back
          </div>
          <div className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--warning)]">{stableCounts.nonfollowers}</div>
        </div>
        <div className="rounded-[14px] border border-[color:var(--success-soft)] bg-[color:var(--success-soft)] p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--success)]">
            <UserPlus size={16} className="shrink-0" />
            Your fans
          </div>
          <div className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--success)]">{stableCounts.fans}</div>
        </div>
        <div className="rounded-[14px] border border-[color:var(--primary-soft)] bg-[color:var(--primary-soft)] p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--primary)]">
            <TrendingUp size={16} className="shrink-0" />
            Mutuals
          </div>
          <div className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--primary)]">{stableCounts.mutuals}</div>
        </div>
      </div>

      {/* Tab bar: Don't follow back | Your fans | Mutuals */}
      <div className="flex gap-1 border-b-[1.5px] border-[color:var(--border)] mb-5 overflow-x-auto">
        {([
          { key: "don't follow back" as TabKey, icon: UserMinus, label: "Don't follow back", count: stableCounts.nonfollowers },
          { key: "fans" as TabKey, icon: UserPlus, label: "Your fans", count: stableCounts.fans },
          { key: "mutuals" as TabKey, icon: TrendingUp, label: "Mutuals", count: stableCounts.mutuals },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[color:var(--primary)] text-[color:var(--text)]"
                : "border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
            }`}
          >
            <tab.icon size={15} aria-hidden />
            <span>{tab.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              activeTab === tab.key ? "bg-[color:var(--primary)] text-white" : "bg-[color:var(--surface-2)] text-[color:var(--text-muted)]"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search, Hide unfollowed, view toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="relative w-full sm:w-auto sm:min-w-[280px] sm:max-w-[340px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-faint)]" />
            <Input
              className="h-10 pl-9 text-sm"
              placeholder="Search usernames…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {activeTab === "don't follow back" && (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[color:var(--text-muted)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-soft)]"
                checked={hideUnfollowed}
                onChange={(e) => setHideUnfollowed(e.target.checked)}
              />
              Hide unfollowed
            </label>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1.5">
            {[
              { v: "list", label: "List", icon: List },
              { v: "grid2", label: "2 col", icon: LayoutGrid },
              { v: "grid3", label: "3 col", icon: LayoutGrid },
            ].map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  view === v ? "bg-[color:var(--primary-soft)] text-[color:var(--primary)]" : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)]"
                }`}
                aria-label={label}
              >
                <Icon size={16} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "mutuals" ? (
        <section className="mt-6 flex flex-col items-center justify-center rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-10 text-center">
          <div className="mb-2 text-sm font-medium uppercase tracking-wide text-[color:var(--text-faint)]">
            Nothing to list
          </div>
          <p className="max-w-md text-sm text-[color:var(--text-muted)] leading-relaxed">
            Instagram&apos;s export doesn&apos;t include a detailed mutuals list — it only gives us followers and
            following. We show the total mutuals count in the stats above, but there isn&apos;t a per-account
            mutuals view available from the data Instagram provides.
          </p>
        </section>
      ) : (
        <>
          <AlphaChips active={alpha} onChange={setAlpha} />

          {/* List/grid cards (1/2/3 columns) */}
          {(view === "list" || view === "grid2" || view === "grid3") && (
            <div className={`mt-5 grid gap-3 ${gridCols}`}>
              {filtered.length === 0 ? (
                <EmptyState
                  msg={
                    items.length
                      ? "No results match your filters. Try clearing filters or adjusting your search."
                      : "Upload your export on the home page to see who doesn’t follow you back."
                  }
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlpha("All");
                        setQuery("");
                      }}
                    >
                      Reset filters
                    </Button>
                  }
                />
              ) : (
                filtered.map((i) => (
                  <UserCard
                    key={i.username}
                    username={i.username}
                    selected={!!selected[i.username]}
                    onToggle={(v)=>toggle(i.username, v)}
                  />
                ))
              )}
            </div>
          )}

          <SelectionBar
            count={selectedCount}
            onCopy={() => {
              const list = Object.keys(selected).filter(k => selected[k]).join("\n");
              navigator.clipboard.writeText(list);
            }}
            onExportCSV={exportSelectedCSV}
            onExportTXT={exportSelectedTXT}
            onClear={clearSelection}
            onOpenWaves={openSelectedInWaves}
            onMarkUnfollowed={activeTab === "don't follow back" ? markSelectedUnfollowed : () => {}}
          />
        </>
      )}

      {null}

      {/* Batch confirm modal */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-[#0F172A]">Mark {confirm.usernames.length} accounts as unfollowed?</div>
            <div className="mt-2 text-sm text-[#475569]">You can undo this for 10 seconds after confirming.</div>
            <div className="mt-4 max-h-48 overflow-auto rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm">
              <div className="flex flex-wrap gap-2">
                {confirm.usernames.slice(0, 24).map(u => (
                  <a key={u} href={`https://instagram.com/${u}`} target="_blank" className="rounded-full bg-white px-3 py-1 text-[#0F172A] shadow-sm hover:underline">@{u}</a>
                ))}
                {confirm.usernames.length > 24 && (
                  <span className="rounded-full bg-white px-3 py-1 text-[#475569] shadow-sm">+{confirm.usernames.length - 24} more</span>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-lg border px-3 py-2 text-sm text-[#0F172A] hover:bg-[#F1F5F9]" onClick={()=> setConfirm({ open: false, usernames: [] })}>Cancel</button>
              <Button onClick={()=> { const list = confirm.usernames; setConfirm({ open: false, usernames: [] }); applyMark(list); }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Undo toast */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-40 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-2xl" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="text-sm text-[#0F172A]">{toast.count} {toast.count === 1 ? "account" : "accounts"} marked unfollowed.</div>
            <button className="text-sm font-medium text-[#1D4ED8] hover:underline" onClick={undoToast}>Undo</button>
          </div>
        </div>
      )}
    </main>
  );
}

// legacy Stat component kept for compatibility if imported elsewhere
function Stat({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return null;
}
