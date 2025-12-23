// Server component - no "use client" directive for SSR SEO content
import { BookOpen, Shield, Download } from "lucide-react";

const guides = [
  {
    href: "/guides/how-to-see-who-doesnt-follow-you-instagram",
    title: "How to see who doesn't follow you on Instagram",
    description: "Step-by-step guide to finding accounts that don't follow you back",
    icon: BookOpen
  },
  {
    href: "/guides/instagram-unfollower-tools-safe",
    title: "Is it safe to use unfollower tools?",
    description: "Learn what makes an unfollower tool safe vs risky for your account",
    icon: Shield
  },
  {
    href: "/guides/download-instagram-followers-data",
    title: "How to download Instagram followers data",
    description: "Complete guide to requesting and downloading your Instagram export",
    icon: Download
  }
];

export function LearnMoreLinks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="mb-2 text-center text-2xl font-bold text-[#0F172A]">Learn More</h2>
      <p className="mb-8 text-center text-sm text-[#64748B]">
        Guides and resources to help you manage your Instagram following
      </p>
      
      <div className="grid gap-4 md:grid-cols-3">
        {guides.map((guide) => {
          const Icon = guide.icon;
          return (
            <a
              key={guide.href}
              href={guide.href}
              className="group rounded-xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#2f6bff]/30 hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-lg bg-[#E8F0FE] p-2 text-[#1D4ED8] transition group-hover:bg-[#2f6bff] group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-[#0F172A] group-hover:text-[#2f6bff]">
                {guide.title}
              </h3>
              <p className="mt-1 text-sm text-[#64748B]">
                {guide.description}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}

