"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

const steps = [
  { 
    n: 1, 
    icon: "📲", 
    title: "Download Your Instagram Export", 
    shortText: "Get your data from Instagram.",
    longText: "Go to Instagram Settings, then Accounts Center, and select \"Download your information.\" Choose your Followers and Following data in JSON or HTML format. Instagram will email you when your export is ready to download."
  },
  { 
    n: 2, 
    icon: "📁", 
    title: "Upload Your Files to Unfollowr", 
    shortText: "Drag & drop your export files.",
    longText: "Upload your Followers and Following files from Instagram's data export directly into Unfollowr. Simply drag and drop both files into the upload area above, or click to browse your computer. We accept both JSON and HTML formats."
  },
  { 
    n: 3, 
    icon: "🔒", 
    title: "Local Processing Keeps You Safe", 
    shortText: "Everything stays on your device.",
    longText: "Unfollowr processes your Instagram data entirely in your browser. Your follower information never leaves your device or gets uploaded to any server. This local-first approach means your data stays private and secure at all times."
  },
  { 
    n: 4, 
    icon: "🔍", 
    title: "See Who Doesn't Follow You Back", 
    shortText: "Get instant, categorized results.",
    longText: "View a complete list of accounts that don't follow you back, intelligently sorted into categories like brands, celebrities, friends, and potential spam. Use smart filters to quickly find specific accounts and decide who to keep following."
  }
];

export function Timeline() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-center text-3xl font-bold text-[#0F172A]">How It Works</h2>

      <div className="relative hidden gap-14 lg:grid">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#E2E8F0] to-transparent" />
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: .4 }}
            transition={{ duration: .4, delay: i * 0.05 }}
            className={`relative flex items-center ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"} mb-16`}
          >
            <div className="w-1/2">
              <Card className="mx-auto max-w-md p-5 text-center">
                <div className="mb-2 text-3xl">{s.icon}</div>
                <h3 className="text-lg font-semibold text-[#0F172A]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{s.longText}</p>
              </Card>
            </div>
            <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-[#2f6bff] text-white shadow-xl">
              {s.n}
            </div>
            <div className="w-1/2" />
          </motion.div>
        ))}
      </div>

      {/* mobile stack */}
      <div className="grid gap-4 lg:hidden">
        {steps.map((s, i) => (
          <Card key={s.n} className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2f6bff] text-sm font-bold text-white">
                {s.n}
              </div>
              <div className="flex-1">
                <div className="text-2xl">{s.icon}</div>
                <h3 className="mt-1 text-base font-semibold text-[#0F172A]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{s.longText}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
