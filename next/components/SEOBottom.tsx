// Server component - no "use client" directive for SSR SEO content

export function SEOBottom() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 md:p-10">
        <h2 className="mb-4 text-2xl font-bold text-[#0F172A]">
          How to See Who Doesn't Follow You Back on Instagram
        </h2>
        
        <div className="space-y-4 text-[#475569] leading-relaxed">
          <p>
            Managing your Instagram following list can be frustrating. You might follow hundreds or 
            thousands of accounts, but how many of them actually follow you back? Instagram doesn't 
            make it easy to find out — there's no built-in feature to see who doesn't follow you back 
            or track who recently unfollowed you.
          </p>
          
          <p>
            This is why Instagram unfollower tools exist. Many people want to clean up their following 
            list, remove accounts that don't engage with their content, or simply understand their 
            follower-to-following ratio better. The challenge is finding a tool that's actually safe 
            to use. Most unfollower apps require your Instagram login, which violates Instagram's 
            terms of service and can result in your account being flagged, restricted, or even banned.
          </p>
          
          <p>
            <strong className="text-[#0F172A]">Unfollowr takes a different approach.</strong> Instead 
            of accessing your Instagram account directly, we use the official data export that Instagram 
            provides to every user. You download your Followers and Following data from Instagram's 
            settings, then upload those files to Unfollowr. Our tool processes everything locally in 
            your browser — your data never touches our servers.
          </p>
          
          <p>
            Within seconds, you'll see a complete list of accounts that don't follow you back, 
            intelligently categorized into groups like brands, celebrities, potential spam, and friends. 
            This makes it easy to decide who you want to keep following and who you might want to 
            unfollow. It's the safest, most private way to track Instagram unfollowers — no login 
            required, no account risk, and complete control over your data.
          </p>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <a 
            href="#upload" 
            className="inline-flex items-center rounded-full bg-[#2f6bff] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d5ae0]"
          >
            Try Unfollowr Free
          </a>
          <a 
            href="#how-it-works" 
            className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-medium text-[#475569] transition hover:bg-[#F7FAFC]"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}

