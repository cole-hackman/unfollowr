// Server component - no "use client" directive for SSR SEO content

export function SEOIntro() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h2 className="mb-4 text-base font-semibold text-[color:var(--text-muted)]">
        About Unfollowr
      </h2>
      <p className="mb-3 text-sm leading-[22px] text-[color:var(--text-faint)]">
        Unfollowr is a powerful, free Instagram unfollower tool built explicitly for privacy and account security. Stop asking "who unfollowed me?" and risking your account. Unlike risky third-party apps that demand your Instagram password and jeopardize your account with API bans, we use a 100% local, offline approach. By securely analyzing your official Instagram data export directly inside your browser, your personal follower data is never uploaded to any external server. 
      </p>
      <p className="text-sm leading-[22px] text-[color:var(--text-faint)]">
        Whether you want to safely track Instagram unfollowers, comprehensively audit your following list, or finally see who isn&apos;t following back, Unfollowr simplifies the process. Our intelligent engine instantly categorizes accounts into distinct groups—like brands, celebrities, friends, and potential spam—empowering you to make fast, insightful decisions about your Instagram growth strategy without compromising your digital privacy.
      </p>
    </section>
  );
}
