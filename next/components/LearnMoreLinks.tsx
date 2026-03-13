const guides = [
  {
    href: "/guides/how-to-see-who-doesnt-follow-you-instagram",
    title: "How to see who doesn't follow you on Instagram",
  },
  {
    href: "/guides/instagram-unfollower-tools-safe",
    title: "Is it safe to use unfollower tools?",
  },
  {
    href: "/guides/download-instagram-followers-data",
    title: "How to download Instagram followers data",
  }
];

export function LearnMoreLinks() {
  return (
    <section className="mx-auto max-w-[720px] px-6 pb-10">
      <div className="grid gap-3 sm:grid-cols-3">
        {guides.map((guide) => (
          <a
            key={guide.href}
            href={guide.href}
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4 text-[13px] font-medium text-[color:var(--text)] transition hover:border-[color:var(--border-strong)] hover:shadow-md hover:text-[color:var(--primary)]"
          >
            {guide.title}
          </a>
        ))}
      </div>
    </section>
  );
}

