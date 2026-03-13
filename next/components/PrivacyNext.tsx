import { Lock, Shield, EyeOff } from "lucide-react";

export function PrivacyNext() {
  return (
    <section
      id="trust-section"
      className="mx-auto max-w-[1080px] px-6 pb-14"
      aria-label="Privacy and data handling"
    >
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-10">
        <div className="flex items-center gap-2.5 text-sm text-[color:var(--text-muted)]">
          <Lock size={16} aria-hidden className="shrink-0" />
          No login required
        </div>
        <div className="flex items-center gap-2.5 text-sm text-[color:var(--text-muted)]">
          <Shield size={16} aria-hidden className="shrink-0" />
          Processed locally
        </div>
        <div className="flex items-center gap-2.5 text-sm text-[color:var(--text-muted)]">
          <EyeOff size={16} aria-hidden className="shrink-0" />
          Data never stored
        </div>
      </div>
    </section>
  );
}
