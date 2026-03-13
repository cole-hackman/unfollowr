"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  { q: "Is my Instagram data private and secure?", a: "Yes. Unfollowr processes your files entirely in your browser. Nothing is uploaded to any server — your data stays on your device." },
  { q: "How is this safer than other unfollower apps?", a: "Most apps require your Instagram login, which risks your account. Unfollowr uses Instagram's official data export instead — no passwords, no API access, no account risk." },
  { q: "How do I download my Instagram data?", a: "Go to Instagram Settings → Accounts Center → Your information and permissions → Download your information. Select Followers and Following in JSON or HTML format." },
  { q: "Do I need to log into Instagram to use this?", a: "No. You never enter your Instagram credentials. You only upload the data export files that Instagram gives you." },
  { q: "Does it work on mobile?", a: "Yes. The upload and results pages work on any modern mobile browser. Just make sure you can access your Instagram export files on your device." },
];

export function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="mx-auto max-w-[720px] px-6 pb-20">
      <div className="text-center mb-10">
        <h2 className="text-[28px] font-bold tracking-[-0.03em] text-[color:var(--text)]">
          Frequently asked questions
        </h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="border-b border-[color:var(--border)] last:border-b-0"
          >
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
              className="flex w-full items-center justify-between px-7 py-5 text-left text-base font-medium text-[color:var(--text)] transition-colors hover:text-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-soft)] focus-visible:ring-inset"
            >
              <span>{item.q}</span>
              <ChevronDown
                size={18}
                className="ml-4 shrink-0 text-[color:var(--text-faint)] transition-transform duration-200"
                style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }}
                aria-hidden
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-200 ease-out"
              style={{
                maxHeight: openFaq === i ? 200 : 0,
                opacity: openFaq === i ? 1 : 0,
                padding: openFaq === i ? "0 28px 22px" : "0 28px 0",
              }}
            >
              <p className="text-sm leading-[22px] text-[color:var(--text-muted)]">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Export FAQ data for schema (match visible content)
export const FAQ_SCHEMA_DATA = FAQ_ITEMS.map((item) => ({
  question: item.q,
  answer: item.a,
}));
