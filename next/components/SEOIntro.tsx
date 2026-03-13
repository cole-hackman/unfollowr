// Server component - no "use client" directive for SSR SEO content

export function SEOIntro() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h2 className="mb-4 text-base font-semibold text-[color:var(--text-muted)]">
        About Unfollowr
      </h2>
      <p className="mb-3 text-sm leading-[22px] text-[color:var(--text-faint)]">
        Unfollowr is a free Instagram unfollower tool that helps you see who doesn&apos;t follow you back. Unlike other apps, we never ask for your Instagram login or password. Simply upload your Instagram data export, and our tool processes everything locally in your browser — your follower data never leaves your device.
      </p>
      <p className="text-sm leading-[22px] text-[color:var(--text-faint)]">
        Whether you want to track Instagram unfollowers, clean up your following list, or just see who isn&apos;t following back, Unfollowr makes it easy. Our smart categorization sorts accounts into brands, celebrities, friends, and potential spam — so you can make informed decisions about who to keep following.
      </p>
    </section>
  );
}
