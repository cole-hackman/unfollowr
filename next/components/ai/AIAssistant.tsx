"use client";
import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SUGGESTIONS = [
  "Hide celebrities and brands",
  "Show spam accounts",
  "Show real friends who don’t follow back",
  "High suggestion scores only"
];

export function AIAssistant({ onPrompt }: { onPrompt: (prompt:string)=>void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        aria-label="Open AI assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full bg-[#2f6bff] text-white shadow-xl"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/30 p-4" onClick={()=>setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2f6bff]" />
              <div className="font-semibold text-[#0F172A]">AI Assistant (coming soon)</div>
            </div>
            <p className="mb-4 text-sm text-[#64748B]">
              Soon you’ll be able to type things like “Hide celebrities” or “Show real friends” and filters will apply instantly.
            </p>
            <div className="grid gap-2">
              {SUGGESTIONS.map((s)=>(
                <Button key={s} variant="outline" onClick={()=>onPrompt(s)} aria-disabled>
                  {s}
                </Button>
              ))}
            </div>
            <div className="mt-4 text-right">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F0FE] px-2 py-1 text-xs text-[#1D4ED8]">Stay tuned — launching soon!</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
