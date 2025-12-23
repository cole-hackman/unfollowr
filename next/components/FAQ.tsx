"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

type QA = { q: string; a: string };

const PRIVACY_QAS: QA[] = [
  { 
    q: "Is my Instagram data private and secure?", 
    a: "Yes, absolutely. Unfollowr processes all your Instagram export files locally in your browser. We don't upload, store, or transmit your data to any server. Your follower information never leaves your device, making this the safest way to track Instagram unfollowers." 
  },
  { 
    q: "How is Unfollowr safer than other unfollower apps?", 
    a: "Unlike most Instagram unfollower tools, we never ask for your Instagram login credentials. Many third-party apps require your password, which violates Instagram's terms of service and puts your account at risk. Unfollowr uses your official Instagram data export instead, keeping your account completely safe." 
  },
  { 
    q: "What information does Unfollowr collect or store?", 
    a: "None of your Instagram export files or follower data is uploaded or stored. We may collect anonymous usage metrics like button clicks to improve the product, but we never access, store, or have visibility into your Instagram data. Everything is processed client-side in your browser." 
  }
];

const GENERAL_QAS: QA[] = [
  { 
    q: "How can I see who unfollowed me on Instagram?", 
    a: "To see who unfollowed you on Instagram, first download your Instagram data export from Settings → Accounts Center → Your information and permissions → Download your information. Select Followers and Following, then upload both files to Unfollowr. We'll instantly show you everyone who doesn't follow you back." 
  },
  { 
    q: "How do I download my Instagram followers data?", 
    a: "Open Instagram, go to Settings, then Accounts Center. Select \"Your information and permissions\" and tap \"Download your information.\" Choose your Instagram account, select \"Some of your information,\" and pick Followers and Following. Choose JSON or HTML format, then request your download. Instagram will email you when it's ready." 
  },
  { 
    q: "Do I need to log into Instagram to use Unfollowr?", 
    a: "No, you never need to log into Instagram through Unfollowr. We don't ask for your username, password, or any login credentials. Instead, you simply upload the data export files that Instagram provides directly to you. This keeps your account secure and compliant with Instagram's policies." 
  },
  { 
    q: "Does Unfollowr work on mobile phones and tablets?", 
    a: "Yes, Unfollowr is fully responsive and works on all devices including iPhones, Android phones, iPads, and desktop browsers. You can upload your Instagram export files from any device and get instant results showing who doesn't follow you back." 
  },
  { 
    q: "Is it safe to use Instagram unfollower tools?", 
    a: "It depends on the tool. Many unfollower apps ask for your Instagram login, which can get your account flagged or banned. Unfollowr is different—we never access your Instagram account directly. We only analyze the data export that Instagram officially provides, making it completely safe and compliant with Instagram's terms of service." 
  }
];

export function FAQ() {
  const [open, setOpen] = useState<Set<string>>(new Set(["p-0", "g-0"]));

  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <section id="faq" className="mx-auto max-w-5xl px-6 pb-20">
      <h2 className="mb-2 text-center text-3xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
      <p className="mb-4 text-center text-sm text-[#64748B]">Private by design. No logins. No uploads. Everything stays on your device.</p>
      <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-3 text-center text-xs text-[#0F172A] sm:text-sm">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3"><span className="text-2xl font-bold text-[#16A34A]">0</span> login attempts required</div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3"><span className="text-2xl font-bold text-[#16A34A]">100%</span> local processing</div>
      </div>

      <h3 className="mt-8 text-base font-semibold text-[#0F172A]">Privacy & Security</h3>
      <div className="mt-3 grid gap-3">
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
                <div className="px-4 pb-4 text-[#475569] leading-relaxed">{item.a}</div>
              )}
            </Card>
          );
        })}
      </div>

      <h3 className="mt-8 text-base font-semibold text-[#0F172A]">General Questions</h3>
      <div className="mt-3 grid gap-3">
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
                <div className="px-4 pb-4 text-[#475569] leading-relaxed">{item.a}</div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

// Export FAQ data for use in server-side schema
export const FAQ_SCHEMA_DATA = [
  ...PRIVACY_QAS.map(qa => ({ question: qa.q, answer: qa.a })),
  ...GENERAL_QAS.map(qa => ({ question: qa.q, answer: qa.a }))
];
