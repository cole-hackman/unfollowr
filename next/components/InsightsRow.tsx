import { Card } from "@/components/ui/Card";
import { Users, MessageSquare, Lightbulb } from "lucide-react";

const items = [
  { title: "Smart Groups", text: "Automatically sorts accounts into Brands, Friends, Spam, and more.", icon: Users },
  { title: "Assistant (Coming Soon)", text: "Soon you’ll type things like ‘Hide celebrities’ and get instant filters.", icon: MessageSquare },
  { title: "Clear Suggestions", text: "See why an account is suggested for removal.", icon: Lightbulb }
];

export function InsightsRow() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-center text-3xl font-bold text-[#0F172A]">Smarter Insights</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon as any;
          return (
            <Card key={it.title} className="h-full p-5">
              <div className="mb-3 inline-flex rounded-lg bg-[#E8F0FE] p-2 text-[#1D4ED8]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A]">{it.title}</h3>
              <p className="mt-1 text-sm text-[#475569]">{it.text}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}


