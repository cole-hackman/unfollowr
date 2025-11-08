"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Upload, Download, CheckCircle2, ChartLine } from "lucide-react";

type Props = {
  onFilesReady: (files: File[]) => void;
};

export function UploadCard({ onFilesReady }: Props) {
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "parsing" | "analyzing" | "complete">("idle");
  const [eta, setEta] = useState<number | null>(null);
  const etaTimerRef = useRef<number | null>(null);
  const analyzingRef = useRef(false);

  useEffect(() => {
    // Controlled easing toward phase caps
    const caps: Record<typeof phase, number> = {
      idle: 0,
      uploading: 60,
      parsing: 85,
      analyzing: 95,
      complete: 100
    } as const;
    const cap = caps[phase];
    if (progress < cap) {
      const t = window.setTimeout(() => setProgress((p) => Math.min(cap, p + 3)), 160);
      return () => window.clearTimeout(t);
    }
  }, [progress, phase]);

  useEffect(() => {
    // ETA countdown for parsing/analyzing
    if (phase === "parsing" || phase === "analyzing") {
      if (etaTimerRef.current) window.clearInterval(etaTimerRef.current);
      etaTimerRef.current = window.setInterval(() => {
        setEta((e) => (e == null ? null : Math.max(0, e - 1)));
      }, 1000);
      return () => { if (etaTimerRef.current) window.clearInterval(etaTimerRef.current); };
    } else {
      if (etaTimerRef.current) window.clearInterval(etaTimerRef.current);
    }
  }, [phase]);

  function accept(files: FileList | null) {
    if (!files || !files.length) return;
    setPhase("uploading");
    setProgress(10);
    // Accept common JSON/HTML types and filenames (.json, .html, .htm); don't over-filter to avoid user confusion
    const list = Array.from(files).filter(f =>
      /json|html/i.test(f.type) || /\.(json|html?|txt)$/i.test(f.name)
    );
    setFiles(list);
    setTimeout(() => {
      // stay under cap until Analyze
      setProgress((p) => Math.max(p, 40));
    }, 400);
  }

  function resetInput() {
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Auto-run analysis once two files are present to avoid getting stuck at 60%
  useEffect(() => {
    if (phase === "uploading" && files.length >= 2 && !analyzingRef.current) {
      (async () => { await handleAnalyze(); })();
    }
  }, [files, phase]);

  const handleAnalyze = async () => {
    if (analyzingRef.current) return;
    analyzingRef.current = true;
    try {
      setPhase("parsing");
      // simple ETA heuristic based on file sizes
      const totalBytes = files.reduce((acc, f) => acc + (f.size || 250_000), 0);
      const estimatedParse = Math.max(2, Math.min(10, Math.round(totalBytes / 750_000))); // ~0.75MB/s
      setEta(estimatedParse + 2);
      setProgress((p) => Math.max(p, 62));
      const textByName: Record<string,string> = {};
      for (const f of files) {
        const t = await f.text();
        textByName[f.name.toLowerCase()] = t;
      }
      setPhase("analyzing");
      setProgress((p) => Math.max(p, 80));
      const followers = parseFollowers(textByName);
      const following = parseFollowing(textByName);
      const nonFollowers = Array.from(following).filter(u => !followers.has(u)).sort((a,b)=>a.localeCompare(b));
      const notFollowingBack = Array.from(followers).filter(u => !following.has(u)).sort((a,b)=>a.localeCompare(b));
      const items = nonFollowers.map(u => ({ username: u, customTags: [], unfollowed: false }));
      const reverseItems = notFollowingBack.map(u => ({ username: u, customTags: [], unfollowed: false }));
      try { sessionStorage.setItem("unfollowr-items", JSON.stringify(items)); } catch {}
      try { sessionStorage.setItem("unfollowr-stats", JSON.stringify({ followers: followers.size, following: following.size })); } catch {}
      try { sessionStorage.setItem("unfollowr-items-reverse", JSON.stringify(reverseItems)); } catch {}
      setPhase("complete");
      setProgress(100);
      setEta(0);
      window.dispatchEvent(new CustomEvent("unfollowr-dataset", { detail: items }));
      // brief completion state for UX
      setTimeout(() => {
        window.location.href = "/results";
      }, 250);
    } finally {
      analyzingRef.current = false;
    }
  };

  return (
    <section id="upload" className="mx-auto mt-12 max-w-5xl px-6">
      <Card className="p-12 md:p-16 text-center">
        {/* Header Icon */}
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#E8F0FE] text-[#1D4ED8] shadow-sm">
          <Upload className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-3xl font-bold text-[#0F172A]">Upload your Instagram export</h3>
        <p className="mt-1 text-sm text-[#64748B]">Drag & drop your Followers + Following files</p>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`mt-8 w-full cursor-pointer rounded-2xl border-2 border-dashed p-14 transition ${
            drag ? "border-[#2f6bff] bg-[#F1F5FE]" : files.length ? "border-green-400 bg-green-50" : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            {files.length ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div className="text-lg font-medium text-green-700">Files selected</div>
                <div className="mt-1 text-xs text-green-700/80">
                  {files.map(f => f.name).join(" • ")}
                </div>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[#2f6bff]" />
                <div className="text-lg font-medium text-[#0F172A]">Drop files here</div>
                <div className="text-xs text-[#64748B]">or click to browse (JSON/HTML files)</div>
              </>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".json,.html,application/json,text/html"
          className="hidden"
          onChange={(e) => accept(e.target.files)}
          aria-label="Upload Instagram export files"
        />

        {/* Buttons Row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <Button className="justify-center" onClick={() => inputRef.current?.click()} iconLeft={<Download className="h-4 w-4" />}>
            Choose files
          </Button>
          <button
            type="button"
            className="rounded-full bg-[#F1F5F9] px-4 py-2 text-sm text-[#475569] hover:bg-[#E2E8F0]"
            onClick={async () => { await useSampleFiles(setFiles); resetInput(); }}
          >
            Try sample files
          </button>
          <Button
            className="justify-center disabled:opacity-50"
            aria-disabled={files.length < 2}
            disabled={files.length < 2}
            onClick={async () => { await handleAnalyze(); }}
            iconLeft={<ChartLine className="h-4 w-4" />}
          >
            Analyze
          </Button>
        </div>

        {/* Stepper + Progress */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#475569]">
            <Step label="Uploading files" active={phase === "uploading" || phase === "parsing" || phase === "analyzing" || phase === "complete"} current={phase === "uploading"} />
            <span>→</span>
            <Step label="Parsing data" active={phase === "parsing" || phase === "analyzing" || phase === "complete"} current={phase === "parsing"} />
            <span>→</span>
            <Step label="Analyzing followers" active={phase === "analyzing" || phase === "complete"} current={phase === "analyzing"} />
            <span>→</span>
            <Step label="Complete" active={phase === "complete"} current={phase === "complete"} />
          </div>

          {progress > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#EEF2FF]"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.4 }}
                className="relative h-2 rounded-full bg-[#2f6bff]"
              >
                {/* subtle animated sheen */}
                <div className="absolute inset-0 animate-[shimmer_1.6s_infinite] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.35),transparent)] bg-[length:200%_100%]" />
              </motion.div>
            </motion.div>
          )}

          {(progress > 0 || phase !== "idle") && (
            <div className="mt-2 text-center text-xs text-[#64748B]">
              <span>{progress}%</span>
              {eta != null && eta > 0 && <span> • ~{eta}s remaining</span>}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}

function Step({ label, active, current }: { label: string; active: boolean; current: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${active ? "bg-[#EEF2FF] text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current ? "bg-[#1D4ED8]" : active ? "bg-[#93C5FD]" : "bg-[#CBD5E1]"}`} />
      <span>{label}</span>
    </div>
  );
}

// --- Minimal client-side parsers ---
function parseFollowers(texts: Record<string,string>): Set<string> {
  // JSON format followers_1.json or multiple parts
  for (const [name, txt] of Object.entries(texts)) {
    if (name.includes("followers") && name.endsWith(".json")) {
      try {
        const data = JSON.parse(txt);
        const out = new Set<string>();
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item?.string_list_data) {
              for (const e of item.string_list_data) {
                const maybe = extractUsernameFromValueOrHref(e?.value, e?.href);
                if (maybe) out.add(maybe);
              }
            }
          }
        }
        if (out.size) return out;
      } catch {}
    }
  }
  // HTML fallback
  for (const [name, txt] of Object.entries(texts)) {
    if (name.includes("followers") && name.endsWith(".html")) {
      const out = extractUsernamesFromHtml(txt);
      if (out.size) return out;
    }
  }
  return new Set();
}

function parseFollowing(texts: Record<string,string>): Set<string> {
  // JSON format following.json
  for (const [name, txt] of Object.entries(texts)) {
    if (name.includes("following") && name.endsWith(".json")) {
      try {
        const data = JSON.parse(txt);
        const out = new Set<string>();
        if (data?.relationships_following && Array.isArray(data.relationships_following)) {
          for (const item of data.relationships_following) {
            if (item?.string_list_data) {
              for (const e of item.string_list_data) {
                const maybe = extractUsernameFromValueOrHref(e?.value, e?.href);
                if (maybe) out.add(maybe);
              }
            }
          }
        }
        if (out.size) return out;
      } catch {}
    }
  }
  // HTML fallback
  for (const [name, txt] of Object.entries(texts)) {
    if (name.includes("following") && name.endsWith(".html")) {
      const out = extractUsernamesFromHtml(txt);
      if (out.size) return out;
    }
  }
  return new Set();
}

function extractUsernamesFromHtml(html: string): Set<string> {
  const out = new Set<string>();
  const RESERVED = new Set([
    "accounts","about","explore","developer","developers","legal","directory","subscriptions",
    "privacy","terms","blog","press","api","p","stories","reels","reel","tv","igtv","challenge",
    "session","ads","help","meta","web","oauth","graphql","notifications","accountscenter",
    "download","locations","emails","n","policies"
  ]);
  const isLikelyUsername = (u: string) => /^[a-z0-9._]{1,30}$/.test(u) && !RESERVED.has(u);
  // Anchor hrefs like https://www.instagram.com/username or https://www.instagram.com/_u/username (allow optional www, trailing slash, query/fragment)
  const hrefRegex = /href=["']https?:\/\/(?:www\.)?instagram\.com\/(?:_u\/)?([^\/"'?#]+)[^"']*["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRegex.exec(html))) {
    const cand = (m[1] || "").toLowerCase();
    if (isLikelyUsername(cand)) out.add(cand);
  }
  // Also @username patterns
  const atRegex = /@([a-zA-Z0-9._]+)/g;
  while ((m = atRegex.exec(html))) {
    const cand = (m[1] || "").toLowerCase();
    if (isLikelyUsername(cand)) out.add(cand);
  }
  return out;
}

function extractUsernameFromValueOrHref(value?: string, href?: string): string | null {
  const val = (value || "").trim();
  const RESERVED = new Set([
    "accounts","about","explore","developer","developers","legal","directory","subscriptions",
    "privacy","terms","blog","press","api","p","stories","reels","reel","tv","igtv","challenge",
    "session","ads","help","meta","web","oauth","graphql","notifications","accountscenter",
    "download","locations","emails","n","policies"
  ]);
  const isLikelyUsername = (u: string) => /^[a-z0-9._]{1,30}$/.test(u) && !RESERVED.has(u);
  // Common IG export puts the profile URL in href and username in value
  if (href) {
    const m = /https?:\/\/(?:www\.)?instagram\.com\/(?:_u\/)?([^\/\s?#]+)/i.exec(href);
    if (m && m[1]) {
      const cand = m[1].toLowerCase();
      if (isLikelyUsername(cand)) return cand;
    }
  }
  if (val) {
    // If value already looks like a username or @username
    const at = /^@?([a-zA-Z0-9._]+)$/.exec(val);
    if (at && at[1]) {
      const cand = at[1].toLowerCase();
      if (isLikelyUsername(cand)) return cand;
    }
  }
  return null;
}

// --- Heuristic classification (no AI) ---
function classifyUsername(username: string): string {
  const u = username.toLowerCase();
  const isSpam = /(free|win|giveaway|forex|crypto|signal|xxx|bet|casino)/.test(u) || /\d{4,}$/.test(u);
  if (isSpam) return "spam";
  const isBrand = /(official|store|shop|brand|inc|llc|ltd|studio|tv|nike|adidas|coca|pepsi|apple|google|meta|amazon|netflix)/.test(u);
  if (isBrand) return "brand";
  const isCelebrity = /(celeb|actor|actress|singer|rapper|nba|nfl|mlb|ufc|fifa|olympic|celebrity|verified)/.test(u);
  if (isCelebrity) return "celebrity";
  const isCreator = /(creator|coach|fitness|artist|musician|writer|influencer|photography|video|film|designer)/.test(u);
  if (isCreator) return "creator";
  const looksRealName = /^[a-z]+[._]?[a-z]+\d{0,3}$/i.test(username);
  if (looksRealName) return "friend";
  return "unknown";
}

// sample files loader (fetches from public/)
async function useSampleFiles(setFiles: (files: File[]) => void) {
  try {
    const [followersRes, followingRes] = await Promise.all([
      fetch("/instagram_followers_sample.html", { cache: "no-cache" }),
      fetch("/instagram_following_sample.html", { cache: "no-cache" })
    ]);
    if (!followersRes.ok || !followingRes.ok) throw new Error("Sample files not found");
    const [followersHtml, followingHtml] = await Promise.all([
      followersRes.text(),
      followingRes.text()
    ]);
    const f1 = new File([followersHtml], "followers_sample.html", { type: "text/html" });
    const f2 = new File([followingHtml], "following_sample.html", { type: "text/html" });
    setFiles([f1, f2]);
  } catch (e) {
    const followersHtml = `<ul><li><a href="https://www.instagram.com/janedoe/">janedoe</a></li></ul>`;
    const followingHtml = `<ul><li><a href="https://www.instagram.com/janedoe/">janedoe</a></li><li><a href="https://www.instagram.com/taylorswift/">taylorswift</a></li></ul>`;
    const f1 = new File([followersHtml], "followers_sample.html", { type: "text/html" });
    const f2 = new File([followingHtml], "following_sample.html", { type: "text/html" });
    setFiles([f1, f2]);
  }
}
