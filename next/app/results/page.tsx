"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlphaChips } from "@/components/results/AlphaChips";
import { SelectionBar } from "@/components/results/SelectionBar";
import { UserCard } from "@/components/results/UserCard";
import { EmptyState } from "@/components/results/EmptyState";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Button } from "@/components/ui/Button";
import { StatusPie } from "@/components/results/StatusPie";
import { CheckCircle2, Users, UserMinus, Percent } from "lucide-react";

type Item = { username: string; score?: number; tags?: string[]; customTags?: string[]; unfollowed?: boolean };

export default function ResultsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [alpha, setAlpha] = useState("All");
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"nonfollowers" | "not-following-back">("nonfollowers");
  const [view, setView] = useState<string>(() => {
    if (typeof window === "undefined") return "grid";
    return localStorage.getItem("unfollowr-view") || "grid";
  });
  const [stats, setStats] = useState<{ followers: number; following: number }>({ followers: 0, following: 0 });
  const [hideUnfollowed, setHideUnfollowed] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; usernames: string[] }>({ open: false, usernames: [] });
  const [toast, setToast] = useState<{ show: boolean; count: number; usernames: string[]; timer?: number }>({ show: false, count: 0, usernames: [] });

  useEffect(() => {
    // Load from sessionStorage first (navigation case)
    try {
      const raw = sessionStorage.getItem("unfollowr-items");
      if (raw) setItems(JSON.parse(raw));
      const sraw = sessionStorage.getItem("unfollowr-stats");
      if (sraw) setStats(JSON.parse(sraw));
      const rraw = sessionStorage.getItem("unfollowr-items-reverse");
      if (!raw && rraw && mode === "not-following-back") setItems(JSON.parse(rraw));
    } catch {}
    function onData(e: any) {
      setItems(e.detail as Item[]);
      try { sessionStorage.setItem("unfollowr-items", JSON.stringify(e.detail)); } catch {}
      try {
        const sraw = sessionStorage.getItem("unfollowr-stats");
        if (sraw) setStats(JSON.parse(sraw));
      } catch {}
    }
    window.addEventListener("unfollowr-dataset", onData as any);
    return () => window.removeEventListener("unfollowr-dataset", onData as any);
  }, []);

  useEffect(() => { try { localStorage.setItem("unfollowr-view", view); } catch {} }, [view]);
  useEffect(() => { setMounted(true); }, []);

  // URL params → state (once)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const letter = params.get("letter");
      const v = params.get("view");
      const m = params.get("mode");
      const q = params.get("q");
      if (letter) setAlpha(letter);
      if (v === "grid" || v === "table") setView(v);
      if (m === "nonfollowers" || m === "not-following-back") setMode(m);
      if (q) setQuery(q);
    } catch {}
  }, []);

  // state → URL params
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      if (alpha !== "All") params.set("letter", alpha);
      if (view !== "grid") params.set("view", view);
      if (query) params.set("q", query);
      if (mode !== "nonfollowers") params.set("mode", mode);
      const search = params.toString();
      const url = search ? `/results?${search}` : "/results";
      window.history.replaceState(null, "", url);
    } catch {}
  }, [alpha, view, query, mode]);

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

  // Wave-based opener with modal (simple inline implementation)
  const [opening, setOpening] = useState<{active:boolean; wave:number; totalWaves:number; perWave:number}>({active:false, wave:0, totalWaves:0, perWave:5});
  const cancelOpenRef = useRef<{cancel:boolean}>({cancel:false});
  async function openSelectedInWaves() {
    const usernames = Object.keys(selected).filter(k => selected[k]);
    const perWave = 5;
    const totalWaves = Math.ceil(usernames.length / perWave);
    setOpening({ active: true, wave: 0, totalWaves, perWave });
    cancelOpenRef.current.cancel = false;
    for (let w = 0; w < totalWaves; w++) {
      if (cancelOpenRef.current.cancel) break;
      const slice = usernames.slice(w*perWave, (w+1)*perWave);
      // Use anchor clicks within user gesture to avoid popup blocking
      slice.forEach((u) => {
        const a = document.createElement("a");
        a.href = `https://instagram.com/${u}`;
        a.target = "_blank";
        a.rel = "noopener";
        // Must be in DOM in some browsers
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
      setOpening({ active: true, wave: w+1, totalWaves, perWave });
      if (w < totalWaves - 1) await new Promise(r => setTimeout(r, 2000));
    }
    setOpening({ active: false, wave: 0, totalWaves: 0, perWave });
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

  // stats helpers
  function calcStats() {
    const followers = stats.followers || 0;
    const following = stats.following || (items.length + stats.followers);
    const nonfollowers = items.length;
    return { followers, following, nonfollowers };
  }

  function calcRatio(a?: number, b?: number) {
    if (!a || !b) return "–";
    const r = a / b;
    return `${(r*100).toFixed(0)}%`;
  }

  if (!mounted) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{mode === "nonfollowers" ? "Non-followers" : "Not following back"}</h1>
          <div className="mt-1 text-sm text-[#64748B]">
            {mode === "nonfollowers"
              ? `${filtered.length} accounts you follow who don’t follow back.`
              : `${filtered.length} accounts who follow you that you don’t follow back.`}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="mr-2 inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1 text-sm">
            <button className={`rounded-lg px-3 py-1 ${mode === "nonfollowers" ? "bg-[#EEF2FF] text-[#1D4ED8]" : "text-[#475569]"}`} onClick={()=>{
              setMode("nonfollowers");
              try {
                const raw = sessionStorage.getItem("unfollowr-items");
                if (raw) setItems(JSON.parse(raw));
              } catch {}
            }}>Non-followers</button>
            <button className={`rounded-lg px-3 py-1 ${mode === "not-following-back" ? "bg-[#EEF2FF] text-[#1D4ED8]" : "text-[#475569]"}`} onClick={()=>{
              setMode("not-following-back");
              try {
                const raw = sessionStorage.getItem("unfollowr-items-reverse");
                if (raw) setItems(JSON.parse(raw));
                else setItems([]);
              } catch {}
            }}>Not following back</button>
          </div>
          <Button variant={view==="grid"?"primary":"outline"} onClick={()=>setView("grid")}>Grid</Button>
          <Button variant={view==="table"?"primary":"outline"} onClick={()=>setView("table")}>Table</Button>
          <Button variant="outline" onClick={()=>{ window.location.href = "/"; }}>Analyze again</Button>
        </div>
      </div>

      {/* stats row */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Followers" value={calcStats().followers} icon={<Users className="h-4 w-4" />} />
        <Stat label="Following" value={calcStats().following} icon={<Users className="h-4 w-4" />} />
        <Stat label="Non-followers" value={calcStats().nonfollowers} icon={<UserMinus className="h-4 w-4" />} />
        <Stat label="Follow ratio" value={calcRatio(calcStats().followers, calcStats().following)} icon={<Percent className="h-4 w-4" />} />
        <Stat label="Unfollowed" value={processedCount} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Stat label="Remaining" value={Math.max(calcStats().nonfollowers - processedCount, 0)} icon={<UserMinus className="h-4 w-4" />} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-[#475569]">
          <input type="checkbox" className="h-4 w-4" checked={hideUnfollowed} onChange={(e)=> setHideUnfollowed(e.target.checked)} />
          Hide unfollowed
        </label>
      </div>

      <div className="mt-6 flex gap-2">
        <input
          className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#94a3b8]"
          placeholder="Search usernames…"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
        />
        <Button variant="outline" onClick={()=>{ setAlpha("All"); setQuery(""); }}>Clear all</Button>
      </div>

      <AlphaChips active={alpha} onChange={setAlpha} />

      {/* grid or table */}
      {view === "grid" ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.length === 0 ? (
            <EmptyState msg={items.length ? "No results match your filters." : "Upload your export on the home page to see results."} action={<Button variant="outline" onClick={()=>{ setAlpha("All"); setQuery(""); }}>Reset filters</Button>} />
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
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
          {filtered.length === 0 ? (
            <div className="p-6"><EmptyState msg={items.length ? "No results match your filters." : "Upload your export on the home page to see results."} action={<Button variant="outline" onClick={()=>{ setAlpha("All"); setQuery(""); }}>Reset filters</Button>} /></div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-3 text-sm text-[#475569]">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2">
                    <input ref={headerSelectRef} type="checkbox" className="h-4 w-4" onChange={(e)=> selectVisible(e.target.checked)} />
                    <span>Select all visible</span>
                  </label>
                  <button className="rounded-md px-2 py-1 hover:bg-[#F1F5F9]" onClick={()=> selectVisible(true)}>Select page</button>
                  <button className="rounded-md px-2 py-1 hover:bg-[#F1F5F9]" onClick={clearSelection}>Clear selection</button>
                </div>
                <div className="text-[#0F172A]">{selectedCount} accounts selected</div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] text-left text-[#475569]">
                  <tr>
                    <th className="px-4 py-3 w-[42px]">
                      {/* empty, header select handled above */}
                    </th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i)=> (
                    <tr key={i.username} className={`border-t border-[#E2E8F0] ${i.unfollowed ? "opacity-60 line-through" : ""}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={!!selected[i.username]}
                          onChange={(e)=> toggle(i.username, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-3 text-[#0F172A]">{i.username}</td>
                      <td className="px-4 py-3">
                        <a className="text-[#475569] hover:underline" href={`https://instagram.com/${i.username}`} target="_blank">Open</a>
                        <button className="ml-3 text-[#475569] hover:underline" onClick={()=> setItems(prev => prev.map(x => x.username===i.username ? { ...x, unfollowed: !x.unfollowed } : x ))}>{i.unfollowed ? "Undo" : "Mark unfollowed"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Analytics Pie */}
      <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-4">
        <div className="mb-3 text-sm font-medium text-[#0F172A]">Progress</div>
        <StatusPie items={items} />
      </div>

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
        onMarkUnfollowed={mode === "nonfollowers" ? markSelectedUnfollowed : () => {}}
      />

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

      <AIAssistant
        onPrompt={(prompt) => {
          if (prompt.includes("Hide celebrities")) {
            setQuery(""); setAlpha("All");
          }
        }}
      />
      {opening.active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="text-lg font-semibold text-[#0F172A]">Opening profiles…</div>
            <div className="mt-2 text-sm text-[#475569]">Wave {opening.wave} of {opening.totalWaves} ({opening.perWave} per wave)</div>
            <div className="mt-4">
              <button className="rounded-lg border px-3 py-1 text-sm" onClick={()=>{ cancelOpenRef.current.cancel = true; setOpening({active:false,wave:0,totalWaves:0,perWave:opening.perWave}); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#64748B]">{icon}{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#0F172A]">{value}</div>
    </div>
  );
}
