"use client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export function UserCard({
  username,
  selected,
  onToggle,
}: {
  username: string;
  selected: boolean;
  onToggle: (v: boolean) => void;
}) {
  const url = `https://instagram.com/${username}`;
  const initial = (username[0] || "").toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.16 }}
      className={`group relative flex items-center gap-3 rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm shadow-sm transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] hover:shadow-md ${
        selected ? "bg-[color:var(--primary-soft)]/60" : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563EB,#60A5FA)] text-sm font-semibold text-white">
        {initial}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium text-[color:var(--text)]">
            @{username}
          </div>
        </div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[color:var(--text-faint)]">
          Instagram account
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary-soft)] hover:text-[color:var(--primary)]"
          aria-label="Open Instagram profile"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <label className="inline-flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-soft)]"
          />
          <span className="hidden sm:inline">Select</span>
        </label>
      </div>
    </motion.div>
  );
}
