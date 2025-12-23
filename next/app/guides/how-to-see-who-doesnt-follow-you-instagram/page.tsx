import { Metadata } from "next";
import Script from "next/script";
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "How to See Who Doesn't Follow You Back on Instagram (2024 Guide) | Unfollowr",
  description: "Learn the safest way to see who doesn't follow you back on Instagram. Step-by-step guide using Instagram's official data export — no login required, no account risk.",
};

const faqData = [
  {
    question: "Can Instagram see if I use an unfollower tool?",
    answer: "If you use tools that require your Instagram login, yes — Instagram can detect unauthorized access and may restrict your account. However, tools like Unfollowr that only analyze your data export don't interact with Instagram at all, so there's no way for Instagram to detect usage."
  },
  {
    question: "How often should I check who unfollowed me?",
    answer: "Most users check weekly or monthly. Checking too frequently can become unhealthy for your mental wellbeing. Remember that follower counts naturally fluctuate, and some unfollows are just inactive accounts being deleted by Instagram."
  },
  {
    question: "Why do people unfollow on Instagram?",
    answer: "People unfollow for many reasons: they may be cleaning up their own feed, they might have followed you hoping for a follow-back, their interests may have changed, or they could be inactive accounts. Don't take unfollows personally — it's a normal part of social media."
  }
];

export default function HowToSeeUnfollowersGuide() {
  return (
    <>
      <Script id="guide-faq-schema" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqData.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer
            }
          }))
        })}
      </Script>
      
      <article className="mx-auto max-w-3xl px-6 py-12">
        <a 
          href="/guides" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#2f6bff]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Guides
        </a>

        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3 text-sm text-[#64748B]">
            <Clock className="h-4 w-4" />
            <span>5 min read</span>
            <span>•</span>
            <span>Updated December 2024</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-[#0F172A] md:text-4xl">
            How to See Who Doesn't Follow You Back on Instagram
          </h1>
          <p className="mt-4 text-lg text-[#64748B]">
            A complete guide to finding non-followers safely, without risking your Instagram account.
          </p>
        </header>

        <div className="prose prose-slate max-w-none">
          <p className="text-[#475569] leading-relaxed">
            Want to know who doesn't follow you back on Instagram? You're not alone. Whether you're 
            trying to clean up your following list, understand your engagement better, or just curious 
            about your follower ratio, finding non-followers is a common goal for Instagram users.
          </p>

          <p className="text-[#475569] leading-relaxed">
            The problem is that Instagram doesn't provide a built-in way to see this information. 
            While you can manually compare your followers and following lists, this becomes impractical 
            when you follow hundreds or thousands of accounts.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">The Safe Way vs. The Risky Way</h2>
          
          <p className="text-[#475569] leading-relaxed">
            There are two main approaches to finding who doesn't follow you back, and the method you 
            choose can have serious consequences for your account.
          </p>

          <div className="my-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Risky: Third-Party Login Apps</span>
              </div>
              <ul className="space-y-2 text-sm text-red-800">
                <li>• Require your Instagram password</li>
                <li>• Violate Instagram's Terms of Service</li>
                <li>• Can get your account flagged or banned</li>
                <li>• May steal your login credentials</li>
                <li>• Often show inaccurate data</li>
              </ul>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Safe: Data Export Analysis</span>
              </div>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• No login required</li>
                <li>• Uses Instagram's official export</li>
                <li>• 100% compliant with Terms of Service</li>
                <li>• Your data stays on your device</li>
                <li>• Accurate, complete results</li>
              </ul>
            </div>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Step-by-Step: Find Non-Followers Safely</h2>

          <h3 className="mt-6 text-xl font-semibold text-[#0F172A]">Step 1: Request Your Instagram Data Export</h3>
          <p className="text-[#475569] leading-relaxed">
            Instagram allows every user to download their account data. Here's how to request it:
          </p>
          <ol className="my-4 list-decimal space-y-2 pl-6 text-[#475569]">
            <li>Open Instagram and go to your profile</li>
            <li>Tap the menu (three lines) and select <strong>Settings</strong></li>
            <li>Go to <strong>Accounts Center</strong> → <strong>Your information and permissions</strong></li>
            <li>Select <strong>Download your information</strong></li>
            <li>Choose your Instagram account</li>
            <li>Select <strong>Some of your information</strong></li>
            <li>Check <strong>Followers and Following</strong></li>
            <li>Choose JSON or HTML format (both work with Unfollowr)</li>
            <li>Submit your request</li>
          </ol>
          <p className="text-[#475569] leading-relaxed">
            Instagram will prepare your download and email you when it's ready — usually within a few 
            minutes to a few hours.
          </p>

          <h3 className="mt-6 text-xl font-semibold text-[#0F172A]">Step 2: Download Your Export Files</h3>
          <p className="text-[#475569] leading-relaxed">
            Once you receive the email from Instagram, click the download link and save the ZIP file 
            to your device. Extract the ZIP file to find your <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-sm">followers_1.json</code> (or HTML) 
            and <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-sm">following.json</code> files.
          </p>

          <h3 className="mt-6 text-xl font-semibold text-[#0F172A]">Step 3: Upload to Unfollowr</h3>
          <p className="text-[#475569] leading-relaxed">
            Now comes the easy part. Go to <a href="/" className="text-[#2f6bff] hover:underline">Unfollowr</a> and 
            drag both files into the upload area. Our tool will process them instantly in your browser — 
            no data is ever uploaded to any server.
          </p>

          <h3 className="mt-6 text-xl font-semibold text-[#0F172A]">Step 4: Review Your Results</h3>
          <p className="text-[#475569] leading-relaxed">
            Within seconds, you'll see a complete list of accounts that don't follow you back. Unfollowr 
            automatically categorizes them into groups like:
          </p>
          <ul className="my-4 list-disc space-y-2 pl-6 text-[#475569]">
            <li><strong>Brands & Businesses</strong> — Company accounts you follow</li>
            <li><strong>Celebrities</strong> — Famous accounts with large followings</li>
            <li><strong>Potential Spam</strong> — Accounts that look suspicious</li>
            <li><strong>Friends</strong> — Accounts that appear to be real people</li>
          </ul>
          <p className="text-[#475569] leading-relaxed">
            This categorization helps you make informed decisions about who to keep following and who 
            you might want to unfollow.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Why This Method Is Better</h2>
          
          <p className="text-[#475569] leading-relaxed">
            Using Instagram's official data export is the only way to check unfollowers without any 
            risk to your account. Here's why it matters:
          </p>

          <ul className="my-4 list-disc space-y-2 pl-6 text-[#475569]">
            <li>
              <strong>No API access needed</strong> — We don't connect to Instagram at all, so there's 
              nothing for Instagram to detect or flag.
            </li>
            <li>
              <strong>Complete privacy</strong> — Your data is processed in your browser and never 
              leaves your device.
            </li>
            <li>
              <strong>Accurate results</strong> — Instagram's export contains your exact follower and 
              following lists, unlike third-party apps that often show incomplete or outdated data.
            </li>
            <li>
              <strong>No account risk</strong> — Since we never access your Instagram account, there's 
              zero chance of getting flagged, restricted, or banned.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
          
          <div className="my-6 space-y-4">
            {faqData.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <h3 className="font-semibold text-[#0F172A]">{item.question}</h3>
                <p className="mt-2 text-[#475569]">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] to-white p-8 text-center">
            <h2 className="text-xl font-semibold text-[#0F172A]">Ready to find your non-followers?</h2>
            <p className="mt-2 text-[#64748B]">
              Upload your Instagram export and see results in seconds — completely free.
            </p>
            <a
              href="/"
              className="mt-4 inline-flex items-center rounded-full bg-[#2f6bff] px-6 py-3 font-medium text-white transition hover:bg-[#1d5ae0]"
            >
              Try Unfollowr Free
            </a>
          </div>
        </div>
      </article>
    </>
  );
}

