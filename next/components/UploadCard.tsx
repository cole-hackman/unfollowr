"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Upload, FileText, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  onFilesReady: (files: File[]) => void;
};

export function UploadCard({ onFilesReady }: Props) {
  const router = useRouter();
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

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
      const exportFormat = inferExportFormat(files);
      trackEvent("analysis_run", {
        accounts_count: following.size,
        non_followers: nonFollowers.length,
        fans: notFollowingBack.length,
        mutuals: Math.max(following.size - nonFollowers.length, 0),
        export_format: exportFormat,
        ai_used: false,
      });
      try { sessionStorage.setItem("unfollowr-items", JSON.stringify(items)); } catch {}
      try { sessionStorage.setItem("unfollowr-stats", JSON.stringify({ followers: followers.size, following: following.size })); } catch {}
      try { sessionStorage.setItem("unfollowr-items-reverse", JSON.stringify(reverseItems)); } catch {}
      setPhase("complete");
      setProgress(100);
      setEta(0);
      window.dispatchEvent(new CustomEvent("unfollowr-dataset", { detail: items }));
      // brief completion state for UX then client-side navigate
      setTimeout(() => {
        try {
          router.push("/results");
        } catch {
          window.location.href = "/results";
        }
      }, 250);
    } finally {
      analyzingRef.current = false;
    }
  };

  return (
    <section id="upload" className="mx-auto max-w-[720px] px-6 pb-0">
      <div className="rounded-[20px] border-[1.5px] border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[color:var(--border-strong)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.06)] md:p-12">
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[color:var(--text)] mb-1.5">
            Upload your Instagram export
          </h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            Drag & drop your Followers + Following files below
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            accept(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
            drag
              ? "border-[color:var(--primary)] bg-[color:var(--primary-soft)]"
              : files.length
                ? "border-[color:var(--success)] bg-[color:var(--success-soft)] py-8"
                : "border-[color:var(--border)] bg-[color:var(--surface-2)] py-14 px-8 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface)]"
          }`}
        >
          <input
            ref={inputRef}
            id="file-input"
            type="file"
            multiple
            accept=".json,.html,.htm,application/json,text/html"
            className="hidden"
            onChange={(e) => accept(e.target.files)}
            aria-label="Upload Instagram export files"
          />
          {files.length === 0 ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[color:var(--primary-soft)]">
                <Upload size={22} className="text-[color:var(--primary)]" aria-hidden />
              </div>
              <p className="text-base font-medium text-[color:var(--text)] mb-1.5">
                Drop your files here
              </p>
              <p className="text-[13px] text-[color:var(--text-faint)]">
                or click to browse · JSON or HTML from Instagram&apos;s export
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {files.map((file, index) => (
                  <div
                    key={file.name + index}
                    className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 pl-3 text-[13px] text-[color:var(--text)]"
                  >
                    <FileText size={14} className="text-[color:var(--text-muted)] shrink-0" aria-hidden />
                    <span className="max-w-[180px] truncate">
                      {file.name?.length > 28 ? file.name.slice(0, 28) + "…" : file.name || `File ${index + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      aria-label={`Remove ${file.name}`}
                      className="flex rounded p-0.5 text-[color:var(--text-faint)] transition-colors hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)]"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[13px] font-medium text-[color:var(--success)]">
                {files.length} file{files.length > 1 ? "s" : ""} selected · Click to add more
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl px-4 text-[13px]"
            >
              Choose files
            </Button>
            <Button
              size="lg"
              disabled={files.length < 2}
              onClick={async () => await handleAnalyze()}
              className="rounded-xl px-7 py-3 text-[15px] disabled:opacity-45 disabled:pointer-events-none"
            >
              Analyze
            </Button>
          </div>
          <button
            type="button"
            onClick={async () => {
              await useSampleFiles(setFiles);
              resetInput();
            }}
            className="text-[13px] font-medium text-[color:var(--text-muted)] underline underline-offset-2 hover:text-[color:var(--text)]"
          >
            Try with sample files
          </button>
        </div>

        {/* Progress (shown only when analyzing) */}
        {progress > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[color:var(--primary-soft)]"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.4 }}
              className="h-2 rounded-full bg-[color:var(--primary)]"
            />
          </motion.div>
        )}
        {progress > 0 && phase !== "idle" && (
          <p className="mt-2 text-center text-xs text-[color:var(--text-muted)]">
            {progress}%
            {eta != null && eta > 0 && <> · ~{eta}s remaining</>}
          </p>
        )}
      </div>
    </section>
  );
}

function inferExportFormat(files: File[]): "HTML" | "JSON" {
  const hasJson = files.some((file) => /\.json$/i.test(file.name));
  return hasJson ? "JSON" : "HTML";
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

  // 1) Full instagram.com profile URLs
  const hrefRegex = /href=["']https?:\/\/(?:www\.)?instagram\.com\/(?:_u\/)?([^\/"'?#]+)[^"']*["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRegex.exec(html))) {
    const cand = (m[1] || "").toLowerCase();
    if (isLikelyUsername(cand)) out.add(cand);
  }

  // 2) Generic anchors – handle relative URLs and other instagram variants
  const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  while ((m = anchorRegex.exec(html))) {
    const href = (m[1] || "").trim();
    const text = (m[2] || "").trim();
    let cand: string | null = null;

    // instagram.com links (including l.instagram.com redirects etc.)
    const igMatch = href.match(/instagram\.com\/(?:_u\/)?([^\/\s?#"']+)/i);
    if (igMatch && igMatch[1]) {
      cand = igMatch[1].toLowerCase();
    } else if (href.startsWith("instagram://user?username=")) {
      const u = href.split("instagram://user?username=")[1]?.split(/[&#?]/)[0];
      if (u) cand = u.toLowerCase();
    } else if (href.startsWith("/")) {
      // Relative profile link like /username/ or /username
      const seg = href.slice(1).split(/[/?#]/)[0];
      if (seg) cand = seg.toLowerCase();
    }

    if (cand && isLikelyUsername(cand)) {
      out.add(cand);
      continue;
    }

    // Fallback: visible text inside the anchor looks like a username
    const textMatch = /^@?([a-zA-Z0-9._]+)$/.exec(text);
    if (textMatch && textMatch[1]) {
      const t = textMatch[1].toLowerCase();
      if (isLikelyUsername(t)) out.add(t);
    }
  }

  // 3) Also @username patterns anywhere in the HTML
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
