"use client";
import clsx from "clsx";

type Counts = Record<string, number>;

export function HeuristicChips({
  segments = ["celebrity","brand","creator","friend","spam","unknown"],
  counts = {},
  active,
  onToggle
}: {
  segments?: string[];
  counts?: Counts;
  active: string[];
  onToggle: (segment: string) => void;
}) {
  return (
    <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white p-2">
      {segments.map(seg => {
        const isActive = active.includes(seg);
        const count = counts[seg] || 0;
        return (
          <button
            key={seg}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(seg)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
              isActive ? "bg-[#E2E8F0] text-[#0F172A]" : "text-[#475569] hover:bg-[#F1F5F9]"
            )}
          >
            <span className="capitalize">{seg}</span>
            {count > 0 && (
              <span className="grid min-w-[20px] place-items-center rounded-full bg-[#E2E8F0] px-1 text-xs text-[#0F172A]">
                {count}
              </span>
            )}
          </button>
        );
      })}
      <div className="ml-auto mr-1 inline-flex items-center gap-1 text-xs text-[#64748B]">
        <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F0FE] px-2 py-1 text-[#1D4ED8]">
          ✨ Smart filters powered by AI — coming soon
        </span>
      </div>
    </div>
  );
}


