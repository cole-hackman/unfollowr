"use client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function UserCard({ username, selected, onToggle }: {
  username: string; selected: boolean; onToggle: (v:boolean)=>void;
}) {
  const url = `https://instagram.com/${username}`;
  const [show, setShow] = useState(false);
  const timerRef = useRef<number | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{top:number;left:number}>({ top: 0, left: 0 });
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);
  function onEnter() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const rect = anchorRef.current?.getBoundingClientRect();
      const top = (rect?.bottom || 0) + window.scrollY + 8;
      let left = (rect?.left || 0) + window.scrollX;
      if (left + 260 > window.scrollX + window.innerWidth) left = window.scrollX + window.innerWidth - 270;
      setPos({ top, left });
      setShow(true);
    }, 300);
  }
  function onLeave() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setShow(false);
  }
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
      className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition will-change-transform hover:border-[#BFDBFE] hover:shadow-lg"
    >
      <div className="flex items-center justify-between" ref={anchorRef} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div className="truncate font-medium text-[#0F172A]">{username}</div>
        <a href={url} target="_blank" className="opacity-70 transition group-hover:opacity-100">
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-[#475569]">
          <input type="checkbox" checked={selected} onChange={(e)=>onToggle(e.target.checked)} className="h-4 w-4" />
          Select
        </label>
      </div>
      {show && (
        <div style={{ top: pos.top, left: pos.left }} className="pointer-events-none absolute z-30 w-64 rounded-xl border border-[#E2E8F0] bg-white p-3 text-left shadow-xl">
          <div className="text-sm font-medium text-[#0F172A]">{username}</div>
          <a className="mt-1 inline-block text-xs text-[#1D4ED8] underline" href={url} target="_blank">Open profile</a>
        </div>
      )}
    </motion.div>
  );
}
