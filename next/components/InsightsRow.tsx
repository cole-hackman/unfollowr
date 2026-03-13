import { Card } from "@/components/ui/Card";
import { Layers, ShieldCheck, WifiOff } from "lucide-react";

const items = [
  {
    title: "Smart categories",
    text: "Automatically groups brands, friends, spam, and more so you can scan faster.",
    icon: Layers,
  },
  {
    title: "100% private",
    text: "Your export is processed locally—nothing is uploaded, logged, or sent to a server.",
    icon: ShieldCheck,
  },
  {
    title: "Works offline",
    text: "No Instagram API, no background syncing. Once loaded, it works without a connection.",
    icon: WifiOff,
  },
];

export function InsightsRow() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
      <h2 className="mb-2 text-center text-3xl font-bold text-[color:var(--text)]">
        Designed for trust
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-[color:var(--text-muted)]">
        Everything about Unfollowr is built to keep your account safe and your data on your device.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon as any;
          return (
            <Card
              key={it.title}
              className="flex h-full flex-col gap-3 border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--border-strong)] hover:shadow-md"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--r-md)] bg-[color:var(--primary-soft)] text-[color:var(--primary)]">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-[color:var(--text)]">
                {it.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--text-muted)]">
                {it.text}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

