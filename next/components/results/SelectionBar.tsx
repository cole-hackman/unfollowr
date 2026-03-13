"use client";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

export function SelectionBar({ count, onCopy, onExportCSV, onExportTXT, onClear, onOpenWaves, onMarkUnfollowed }:{
  count:number; onCopy:()=>void; onExportCSV:()=>void; onExportTXT:()=>void; onClear:()=>void; onOpenWaves:()=>void; onMarkUnfollowed:()=>void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(()=> setVisible(count>0), [count]);

  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 shadow-2xl backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-[color:var(--text-muted)]">
          <span className="font-medium text-[color:var(--text)]">{count}</span> selected
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" onClick={onOpenWaves}>
            Open profiles
          </Button>
          <Button variant="outline" size="sm" onClick={onMarkUnfollowed}>
            Mark unfollowed
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy}>
            Copy usernames
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            aria-disabled={!count}
            disabled={!count}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportTXT}
            aria-disabled={!count}
            disabled={!count}
          >
            Export TXT
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
