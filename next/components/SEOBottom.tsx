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
            This is why reliable Instagram unfollower tools exist. Creators and everyday users alike want to routinely 
            clean up their following list, remove inactive accounts that drag down their engagement metrics, or simply understand their 
            follower-to-following ratio. However, the biggest challenge is finding an unfollower tracker that is actually secure. 
            The vast majority of unfollower apps illegally demand your Instagram login credentials, directly violating Instagram's 
            terms of service. This incredibly dangerous practice frequently results in your account being flagged, shadowbanned, or permanently disabled.
          </p>
          
          <p>
            <strong className="text-[color:var(--text)]">Unfollowr uses a vastly superior, offline approach.</strong> By eliminating the need 
            to access your Instagram account via invasive APIs, we built a system that relies solely on the official data export feature 
            that Meta provides to every user. First, you securely request and download your Followers and Following data archive directly from Instagram's 
            privacy settings. Next, you load those raw HTML or JSON files into Unfollowr. Our web application runs 100% locally inside 
            your browser — analyzing the data without uploading anything to a remote database. Total privacy, zero hacking risk.
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

