"use client";
import clsx from "clsx";

const letters = ["All",..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];

export function AlphaChips({ active, onChange }: { active: string; onChange: (v:string)=>void }) {
  return (
    <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white p-2">
      {letters.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={clsx(
            "min-w-[38px] rounded-lg px-3 py-1.5 text-sm text-[#475569] hover:bg-[#F1F5F9]",
            active === l && "bg-[#E2E8F0] font-medium text-[#0F172A]"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
