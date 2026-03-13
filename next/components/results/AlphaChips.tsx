"use client";
import clsx from "clsx";

const letters = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];

export function AlphaChips({
  active,
  onChange,
}: {
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-1.5">
      {letters.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={clsx(
            "min-w-[38px] rounded-[999px] px-3 py-1.5 text-xs font-medium transition",
            active === l
              ? "bg-[color:var(--primary)] text-white shadow-sm"
              : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)]"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
