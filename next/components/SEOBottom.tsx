// Server component - no "use client" directive for SSR SEO content
import { Card } from "@/components/ui/Card";

export function SEOBottom() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <Card className="p-8 md:p-10">
        <h2 className="mb-4 text-2xl font-bold text-[color:var(--text)]">
          How to See Who Doesn't Follow You Back on Instagram
        </h2>
        
        <div className="space-y-4 leading-relaxed text-[color:var(--text-muted)]">
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
            <strong className="text-[color:var(--text)]">Unfollowr takes a different approach.</strong> Instead 
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
            className="inline-flex items-center justify-center rounded-[var(--r-md)] bg-[color:var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[color:var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
          >
            Try Unfollowr Free
          </a>
          <a 
            href="#how-it-works" 
            className="inline-flex items-center justify-center rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-5 py-2.5 text-sm font-medium text-[color:var(--text)] transition hover:bg-[color:var(--bg-accent)] hover:border-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]"
          >
            See How It Works
          </a>
        </div>
      </Card>
    </section>
  );
}

