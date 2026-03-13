"use client";

const steps = [
  { num: "1", title: "Export your data", desc: "Download your Followers & Following files from Instagram's settings." },
  { num: "2", title: "Upload here", desc: "Drag and drop both files into Unfollowr. We accept JSON and HTML." },
  { num: "3", title: "See results", desc: "Instantly see who doesn't follow you back, sorted by category." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1080px] px-6 pb-24 md:pb-[96px]">
      <div className="text-center mb-12">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--primary)] mb-2.5">
          How it works
        </p>
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-[color:var(--text)] md:text-[30px]">
          Three steps, thirty seconds
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.num}
            className="rounded-2xl border-[1.5px] border-[color:var(--border)] bg-[color:var(--surface)] px-7 py-8 transition-all hover:border-[color:var(--border-strong)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:-translate-y-0.5"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--primary-soft)] text-lg font-bold text-[color:var(--primary)]">
              {s.num}
            </div>
            <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-[color:var(--text)] mb-2">
              {s.title}
            </h3>
            <p className="text-sm leading-[22px] text-[color:var(--text-muted)]">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
