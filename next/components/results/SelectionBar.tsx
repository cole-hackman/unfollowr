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
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="text-sm text-[#475569]">{count} selected</div>
        <Button variant="outline" onClick={onOpenWaves}>Open profiles</Button>
        <Button variant="outline" onClick={onMarkUnfollowed}>Mark unfollowed</Button>
        <Button variant="outline" onClick={onCopy}>Copy usernames</Button>
        <Button variant="outline" onClick={onExportCSV} aria-disabled={!count} disabled={!count}>Export CSV</Button>
        <Button variant="outline" onClick={onExportTXT} aria-disabled={!count} disabled={!count}>Export TXT</Button>
        <Button variant="ghost" onClick={onClear}>Clear</Button>
      </div>
    </div>
  );
}
