"use client";
import { Button } from "@/components/ui/Button";
import { Shield, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-rain" />
      <div className="relative z-[1] mx-auto max-w-[720px] px-6 pt-20 pb-16 text-center md:pt-[80px] md:pb-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary-soft)] px-[14px] py-1.5 text-[13px] font-semibold text-[color:var(--primary)] mb-7">
          <Shield size={14} aria-hidden />
          No login required — 100% private
        </div>
        <h1
          className="text-[40px] font-bold leading-[1.12] tracking-[-0.035em] text-[color:var(--text)] mb-[18px] md:text-[52px] md:leading-[58px]"
          style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", fontWeight: 700 }}
        >
          Instagram unfollowers:
          <br />
          see who doesn&apos;t follow you back
        </h1>
        <p className="mx-auto max-w-[480px] text-base leading-7 text-[color:var(--text-muted)] mb-9 md:text-lg md:leading-7">
          Upload your Instagram export. Get instant results.
          <br />
          Your data never leaves your device.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold shadow-[0_1px_3px_rgba(37,99,235,0.2),0_4px_12px_rgba(37,99,235,0.12)] hover:shadow-[0_2px_6px_rgba(37,99,235,0.25),0_8px_20px_rgba(37,99,235,0.15)] hover:-translate-y-px"
          >
            Upload export
            <ArrowRight size={18} aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-xl border-[1.5px] border-[color:var(--border)] px-7 py-3.5 text-base font-medium text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]"
          >
            How it works
          </Button>
        </div>
      </div>
    </section>
  );
}
