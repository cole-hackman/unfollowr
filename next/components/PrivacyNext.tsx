import { Card } from "@/components/ui/Card";
import { Shield, Rocket } from "lucide-react";

export function PrivacyNext() {
  return (
    <section id="trust-section" className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-center text-3xl font-bold text-[#0F172A]">Privacy & Security</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="mb-2 inline-flex rounded-lg bg-[#E8F0FE] p-2 text-[#1D4ED8]">
            <Shield aria-hidden="true" className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Privacy first</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#475569]">
            <li>No login required</li>
            <li>Session-based; local analysis</li>
            <li>We never store your files</li>
          </ul>
        </Card>
        <Card className="p-5">
          <div className="mb-2 inline-flex rounded-lg bg-[#E8F0FE] p-2 text-[#1D4ED8]">
            <Rocket aria-hidden="true" className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">What’s next</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#475569]">
            <li>Twitter & TikTok exports</li>
            <li>Saved sessions & diffs</li>
            <li>CSV export</li>
            <li>Advanced filters</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}


