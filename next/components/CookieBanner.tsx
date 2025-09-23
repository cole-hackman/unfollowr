"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(localStorage.getItem("cookie-ok") !== "1"); }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b1020]/95 p-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <p className="text-sm text-white/80">
          We use only essential cookies (no tracking). See our <a className="underline" href="/privacy">privacy policy</a>.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>setOpen(false)}>Decline</Button>
          <Button onClick={()=>{ localStorage.setItem("cookie-ok","1"); setOpen(false); }}>Accept</Button>
        </div>
      </div>
    </div>
  );
}
