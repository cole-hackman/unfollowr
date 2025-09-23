"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

type QA = { q: string; a: string };

const PRIVACY_QAS: QA[] = [
  { q: "Is my data private?", a: "Yes. Files are processed locally in your browser. We don’t upload, store, or retain your files. 0 login attempts required. 100% local processing." },
  { q: "How is this safer than other apps?", a: "We never ask for your Instagram login, don’t store your files, and keep processing local-first. You stay in control." },
  { q: "What information does Unfollowr keep?", a: "None of your export files are uploaded or stored. We may record anonymous usage metrics (e.g., feature clicks) to improve the product, but never your Instagram data." }
];

const GENERAL_QAS: QA[] = [
  { q: "How do I get my Instagram export?", a: "Instagram → Settings → Accounts Center → Your information and permissions → Download your information. Choose Followers and Following as JSON or HTML." },
  { q: "Does this work on mobile and desktop?", a: "Yes. Unfollowr is responsive and works on iOS, Android, and desktop browsers." }
];

export function FAQ() {
  const [open, setOpen] = useState<Set<string>>(new Set(["p-0", "p-1", "g-0"]));
  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }
  return (
    <section id="faq" className="mx-auto max-w-5xl px-6 pb-20">
      <h2 className="mb-2 text-center text-3xl font-bold text-[#0F172A]">Privacy & FAQ</h2>
      <p className="mb-4 text-center text-sm text-[#64748B]">Private by design. No logins. No uploads. Everything stays on your device.</p>
      <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-3 text-center text-xs text-[#0F172A] sm:text-sm">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3"><span className="text-2xl font-bold text-[#16A34A]">0</span> login attempts required</div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3"><span className="text-2xl font-bold text-[#16A34A]">100%</span> local processing</div>
      </div>
      <div className="mt-6 text-sm font-semibold text-[#0F172A]">Privacy & Security</div>
      <div className="grid gap-3">
        {PRIVACY_QAS.map((item, idx) => {
          const key = `p-${idx}`;
          const isOpen = open.has(key);
          return (
            <Card key={key} className="overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#F7FAFC]"
                aria-expanded={isOpen}
                onClick={() => toggle(key)}
              >
                <span className="font-medium text-[#0F172A]">{item.q}</span>
                <span className="text-[#475569]">{isOpen ? "–" : "+"}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-[#475569]">{item.a}</div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-6 text-sm font-semibold text-[#0F172A]">General</div>
      <div className="grid gap-3">
        {GENERAL_QAS.map((item, idx) => {
          const key = `g-${idx}`;
          const isOpen = open.has(key);
          return (
            <Card key={key} className="overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#F7FAFC]"
                aria-expanded={isOpen}
                onClick={() => toggle(key)}
              >
                <span className="font-medium text-[#0F172A]">{item.q}</span>
                <span className="text-[#475569]">{isOpen ? "–" : "+"}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-[#475569]">{item.a}</div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}


