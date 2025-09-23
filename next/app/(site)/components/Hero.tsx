"use client";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { LogoGlyph } from "@/components/icons/LogoGlyph";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 pt-20 text-center">
      {/* subtle radial bg */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(13,110,253,0.08),transparent_60%)]" />

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-[#0F172A] md:text-6xl"
      >
        Find out who’s not following back.
      </motion.h1>

      <p className="mx-auto mt-4 max-w-2xl text-[#475569]">
        Upload your Instagram export and get clear, private results in seconds.
      </p>

      {/* CTAs removed per request */}
      {null}
    </section>
  );
}
