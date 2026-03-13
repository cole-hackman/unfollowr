"use client";
import { Lock, Shield, FileText, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

const whyFeatures = [
  { icon: Lock, title: "No Login", desc: "Never enter your Instagram password" },
  { icon: Shield, title: "100% Private", desc: "All processing happens locally in your browser" },
  { icon: FileText, title: "Official Data", desc: "Uses Instagram's official data export" },
  { icon: Zap, title: "Smart Analysis", desc: "Intelligent suggestions on who to unfollow" },
];

export function WhyUnfollowr() {
  return (
    <section className="mx-auto max-w-[1080px] px-6 py-24 md:py-[96px]">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:items-center">
        {/* Left — explanation + comparison */}
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--primary)] mb-3">
            Why Unfollowr?
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-[color:var(--text)] mb-4 md:text-[30px]">
            The safe way to check unfollowers
          </h2>
          <p className="text-[15px] leading-6 text-[color:var(--text-muted)] mb-8">
            Most Instagram follower trackers require your login credentials or use unofficial APIs that can get your account banned. Unfollowr takes a completely different approach.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3.5 items-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--danger-soft)]">
                <AlertTriangle size={18} className="text-[color:var(--danger)]" aria-hidden />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[color:var(--text)] mb-0.5">Other apps</p>
                <p className="text-sm leading-[21px] text-[color:var(--text-muted)]">
                  Require your password or use sketchy APIs that risk account bans
                </p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--success-soft)]">
                <CheckCircle2 size={18} className="text-[color:var(--success)]" aria-hidden />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[color:var(--text)] mb-0.5">Unfollowr</p>
                <p className="text-sm leading-[21px] text-[color:var(--text-muted)]">
                  Uses Instagram&apos;s official data exports. Zero risk to your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — 2×2 feature grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {whyFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[14px] border-[1.5px] border-[color:var(--border)] bg-[color:var(--surface)] p-6 transition-all hover:border-[color:var(--border-strong)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              >
                <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[color:var(--primary-soft)]">
                  <Icon size={19} className="text-[color:var(--primary)]" aria-hidden />
                </div>
                <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--text)] mb-1">
                  {item.title}
                </h4>
                <p className="text-[13px] leading-5 text-[color:var(--text-muted)]">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
