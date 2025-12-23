import { Metadata } from "next";
import { BookOpen, Shield, Download, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Instagram Guides & Resources | Unfollowr",
  description: "Learn how to track Instagram unfollowers, download your Instagram data, and safely manage your following list with our comprehensive guides.",
};

const guides = [
  {
    href: "/guides/how-to-see-who-doesnt-follow-you-instagram",
    title: "How to See Who Doesn't Follow You Back on Instagram",
    description: "A complete step-by-step guide to finding accounts that don't follow you back on Instagram. Learn the safest methods that won't risk your account.",
    icon: BookOpen,
    readTime: "5 min read"
  },
  {
    href: "/guides/instagram-unfollower-tools-safe",
    title: "Is It Safe to Use Instagram Unfollower Tools?",
    description: "Understand the risks of different unfollower tools and learn how to identify safe options that won't get your Instagram account banned.",
    icon: Shield,
    readTime: "4 min read"
  },
  {
    href: "/guides/download-instagram-followers-data",
    title: "How to Download Your Instagram Followers Data",
    description: "Step-by-step instructions for requesting and downloading your Instagram data export, including followers and following lists.",
    icon: Download,
    readTime: "3 min read"
  }
];

export default function GuidesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-[#0F172A]">Instagram Guides</h1>
        <p className="mt-4 text-lg text-[#64748B]">
          Learn how to safely track unfollowers, manage your following list, and get the most out of your Instagram data.
        </p>
      </div>

      <div className="grid gap-6">
        {guides.map((guide) => {
          const Icon = guide.icon;
          return (
            <a
              key={guide.href}
              href={guide.href}
              className="group flex gap-5 rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#2f6bff]/30 hover:shadow-lg"
            >
              <div className="shrink-0">
                <div className="inline-flex rounded-xl bg-[#E8F0FE] p-3 text-[#1D4ED8] transition group-hover:bg-[#2f6bff] group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold text-[#0F172A] group-hover:text-[#2f6bff]">
                    {guide.title}
                  </h2>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[#94A3B8] transition group-hover:translate-x-1 group-hover:text-[#2f6bff]" />
                </div>
                <p className="mt-2 text-[#64748B]">{guide.description}</p>
                <span className="mt-3 inline-block text-sm text-[#94A3B8]">{guide.readTime}</span>
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] to-white p-8 text-center">
        <h2 className="text-xl font-semibold text-[#0F172A]">Ready to see who doesn't follow you back?</h2>
        <p className="mt-2 text-[#64748B]">
          Upload your Instagram export and get results in seconds — completely free and private.
        </p>
        <a
          href="/"
          className="mt-4 inline-flex items-center rounded-full bg-[#2f6bff] px-6 py-3 font-medium text-white transition hover:bg-[#1d5ae0]"
        >
          Try Unfollowr Free
        </a>
      </div>
    </main>
  );
}

