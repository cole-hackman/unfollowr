"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Bot, Quote } from "lucide-react";

const QUERIES = [
  "Hide celebrities and brands",
  "Show me spam accounts",
  "Who are my real friends?"
];

export function AssistantDemo() {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="mb-2 text-center text-3xl font-bold">Assistant</h2>
      <p className="mb-4 text-center text-sm text-[#64748B]">Coming soon — type things like “Hide celebrities” and get instant filters.</p>
      <Card className="mx-auto max-w-2xl p-4">
        <div className="flex items-start gap-2 text-sm text-[#475569]">
          <Bot aria-hidden="true" className="mt-0.5 h-4 w-4 text-[#1D4ED8]" />
          <div>
            We’re finishing up a private, optional AI assistant. It won’t send your files anywhere without consent.
          </div>
        </div>
      </Card>
    </section>
  );
}


