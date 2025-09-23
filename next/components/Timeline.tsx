"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

const steps = [
  { n: 1, icon: "📉", title: "Notice drops", text: "Followers down?" },
  { n: 2, icon: "📲", title: "Download export", text: "Grab Followers + Following." },
  { n: 3, icon: "🚀", title: "Drop into Unfollowr", text: "Drag & drop, local parse." },
  { n: 4, icon: "🔍", title: "See results instantly", text: "Who unfollowed + smart filters." }
];

export function Timeline() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-center text-4xl font-bold text-[#0F172A]">How it works</h2>

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
              <Card className="mx-auto max-w-md p-4 text-center">
                <div className="mb-2 text-3xl">{s.icon}</div>
                <h3 className="text-lg font-semibold text-[#0F172A]">{s.title}</h3>
                <p className="mt-1 text-sm text-[#475569]">{s.text}</p>
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
      <div className="grid gap-3 lg:hidden">
        {steps.map((s, i) => (
          <Card key={s.n} className="p-4">
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-1 text-xs text-white/60">Step {s.n}</div>
            <h3 className="text-base font-semibold text-[#0F172A]">{s.title}</h3>
            <p className="text-sm text-[#475569]">{s.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
