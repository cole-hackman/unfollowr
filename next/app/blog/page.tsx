import { Metadata } from "next";
import { LineChart, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Unfollowr Blog | Instagram Analytics & Audience Insights",
  description: "Read our latest articles on Instagram growth, follower analytics, privacy, and audience engagement strategies.",
  alternates: { canonical: "/blog" },
};

const blogPosts = [
  {
    href: "/blog/instagram-data-analysis-track-unfollows-securely",
    title: "Instagram Data Analysis: Track Unfollows Securely in 2026",
    description: "Learn how to use Instagram's official data export feature to analyze followers safely without risking account security.",
    icon: LineChart,
    readTime: "8 min read"
  },
  {
    href: "/blog/instagram-celebrity-followers-value-myths-impact",
    title: "Instagram Celebrity Followers: Value, Myths & Real Impact",
    description: "Discover why celebrity followers rarely boost your engagement rate, what they're actually good for, and how to focus on real Instagram growth.",
    icon: Star,
    readTime: "7 min read"
  }
];

export default function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-[#0F172A]">Unfollowr Blog</h1>
        <p className="mt-4 text-lg text-[#64748B]">
          Insights and deeper analysis on Instagram audience behavior, growth, and analytics privacy.
        </p>
      </div>

      <div className="grid gap-6">
        {blogPosts.map((post) => {
          const Icon = post.icon;
          return (
            <a
              key={post.href}
              href={post.href}
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
                    {post.title}
                  </h2>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[#94A3B8] transition group-hover:translate-x-1 group-hover:text-[#2f6bff]" />
                </div>
                <p className="mt-2 text-[#64748B]">{post.description}</p>
                <span className="mt-3 inline-block text-sm text-[#94A3B8]">{post.readTime}</span>
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
          Analyze Your Audience
        </a>
      </div>
    </main>
  );
}
