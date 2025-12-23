// Server component - no "use client" directive for SSR SEO content

export function SEOIntro() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10 text-center">
      <p className="text-base leading-relaxed text-[#475569]">
        <strong className="text-[#0F172A]">Unfollowr</strong> is a free Instagram unfollower tool 
        that helps you see who doesn't follow you back. Unlike other apps, we never ask for your 
        Instagram login or password. Simply upload your Instagram data export, and our tool 
        processes everything locally in your browser — your follower data never leaves your device.
      </p>
      <p className="mt-4 text-base leading-relaxed text-[#475569]">
        Whether you want to track Instagram unfollowers, clean up your following list, or just 
        see who isn't following back, Unfollowr makes it easy. Our smart categorization sorts 
        accounts into brands, celebrities, friends, and potential spam — so you can make informed 
        decisions about who to keep following. It's the safest way to manage your Instagram 
        connections with complete privacy.
      </p>
    </section>
  );
}

