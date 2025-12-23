import { Metadata } from "next";
import Script from "next/script";
import { ArrowLeft, Download, Clock, Smartphone, Monitor } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Download Your Instagram Followers Data (2024 Guide) | Unfollowr",
  description: "Step-by-step instructions for downloading your Instagram data export, including followers and following lists. Works on iPhone, Android, and desktop.",
};

const faqData = [
  {
    question: "How long does it take to get my Instagram data export?",
    answer: "Instagram typically prepares your download within a few minutes to a few hours. For accounts with lots of data, it may take up to 48 hours. You'll receive an email notification when your download is ready."
  },
  {
    question: "What format should I choose for my Instagram export?",
    answer: "Both JSON and HTML formats work with Unfollowr. JSON is more compact and processes faster, while HTML is human-readable if you want to view the files directly. Either format contains the same follower and following data."
  },
  {
    question: "Can I download just my followers list without other data?",
    answer: "Yes! When requesting your download, select 'Some of your information' instead of 'All available information.' Then check only 'Followers and Following' to get just the data you need for tracking unfollowers."
  }
];

export default function DownloadInstagramDataGuide() {
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
            <span>3 min read</span>
            <span>•</span>
            <span>Updated December 2024</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-[#0F172A] md:text-4xl">
            How to Download Your Instagram Followers Data
          </h1>
          <p className="mt-4 text-lg text-[#64748B]">
            Complete guide to requesting and downloading your Instagram data export on any device.
          </p>
        </header>

        <div className="prose prose-slate max-w-none">
          <p className="text-[#475569] leading-relaxed">
            Instagram gives every user the ability to download their account data, including complete 
            lists of everyone who follows you and everyone you follow. This data export is essential 
            for using safe unfollower tools like Unfollowr.
          </p>

          <p className="text-[#475569] leading-relaxed">
            In this guide, we'll walk you through the exact steps to download your Instagram followers 
            data on mobile (iPhone/Android) and desktop.
          </p>

          <div className="my-8 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
            <h3 className="flex items-center gap-2 font-semibold text-[#0F172A]">
              <Clock className="h-5 w-5 text-[#2f6bff]" />
              Before You Start
            </h3>
            <p className="mt-2 text-sm text-[#475569]">
              Make sure you have access to the email address associated with your Instagram account. 
              Instagram will send a download link to this email when your export is ready.
            </p>
          </div>

          <h2 className="mt-10 flex items-center gap-3 text-2xl font-bold text-[#0F172A]">
            <Smartphone className="h-7 w-7 text-[#2f6bff]" />
            Download on Mobile (iPhone & Android)
          </h2>
          
          <ol className="my-4 list-decimal space-y-4 pl-6 text-[#475569]">
            <li>
              <strong>Open Instagram</strong> and tap your profile picture in the bottom right corner.
            </li>
            <li>
              <strong>Tap the menu icon</strong> (three horizontal lines) in the top right corner.
            </li>
            <li>
              <strong>Select "Settings and privacy"</strong> from the menu.
            </li>
            <li>
              <strong>Tap "Accounts Center"</strong> at the top of the settings page.
            </li>
            <li>
              <strong>Select "Your information and permissions"</strong> from the list.
            </li>
            <li>
              <strong>Tap "Download your information"</strong>.
            </li>
            <li>
              <strong>Choose your Instagram account</strong> if you have multiple accounts linked.
            </li>
            <li>
              <strong>Select "Some of your information"</strong> (this lets you choose specific data).
            </li>
            <li>
              <strong>Scroll down and check "Followers and Following"</strong>. You can uncheck other 
              options if you only need follower data.
            </li>
            <li>
              <strong>Tap "Next"</strong> to continue.
            </li>
            <li>
              <strong>Choose "Download to device"</strong> as your destination.
            </li>
            <li>
              <strong>Select your preferred format</strong>: JSON (recommended) or HTML.
            </li>
            <li>
              <strong>Set the date range</strong> to "All time" for complete data.
            </li>
            <li>
              <strong>Tap "Create files"</strong> to submit your request.
            </li>
          </ol>

          <p className="text-[#475569] leading-relaxed">
            Instagram will now prepare your download. You'll receive an email notification (and an 
            Instagram notification) when it's ready. This usually takes a few minutes but can take 
            up to 48 hours for larger accounts.
          </p>

          <h2 className="mt-10 flex items-center gap-3 text-2xl font-bold text-[#0F172A]">
            <Monitor className="h-7 w-7 text-[#2f6bff]" />
            Download on Desktop (Web Browser)
          </h2>
          
          <ol className="my-4 list-decimal space-y-4 pl-6 text-[#475569]">
            <li>
              <strong>Go to instagram.com</strong> and log into your account.
            </li>
            <li>
              <strong>Click "More"</strong> in the left sidebar, then select <strong>"Settings"</strong>.
            </li>
            <li>
              <strong>Click "Accounts Center"</strong> in the left menu.
            </li>
            <li>
              <strong>Select "Your information and permissions"</strong>.
            </li>
            <li>
              <strong>Click "Download your information"</strong>.
            </li>
            <li>
              <strong>Select your Instagram account</strong>.
            </li>
            <li>
              <strong>Choose "Some of your information"</strong>.
            </li>
            <li>
              <strong>Check "Followers and Following"</strong> and uncheck other options.
            </li>
            <li>
              <strong>Click "Next"</strong>.
            </li>
            <li>
              <strong>Select "Download to device"</strong>.
            </li>
            <li>
              <strong>Choose JSON or HTML format</strong>.
            </li>
            <li>
              <strong>Set date range to "All time"</strong>.
            </li>
            <li>
              <strong>Click "Create files"</strong>.
            </li>
          </ol>

          <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Downloading Your Export File</h2>
          
          <p className="text-[#475569] leading-relaxed">
            Once your export is ready, you'll receive an email from Instagram with a download link. 
            Here's what to do:
          </p>

          <ol className="my-4 list-decimal space-y-3 pl-6 text-[#475569]">
            <li>
              <strong>Open the email</strong> from Instagram (check spam if you don't see it).
            </li>
            <li>
              <strong>Click "Download your information"</strong> in the email.
            </li>
            <li>
              <strong>Log into Instagram</strong> if prompted to verify your identity.
            </li>
            <li>
              <strong>Click "Download"</strong> to save the ZIP file to your device.
            </li>
            <li>
              <strong>Extract the ZIP file</strong> to access your data files.
            </li>
          </ol>

          <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-amber-800">Important: Download Link Expires</h3>
            <p className="mt-1 text-sm text-amber-700">
              The download link in Instagram's email expires after 4 days. Make sure to download your 
              data before it expires, or you'll need to request a new export.
            </p>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Finding Your Follower Files</h2>
          
          <p className="text-[#475569] leading-relaxed">
            After extracting the ZIP file, you'll find your follower data in these locations:
          </p>

          <div className="my-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 font-mono text-sm">
            <p className="text-[#475569]"><strong>JSON format:</strong></p>
            <p className="text-[#64748B]">connections/followers_and_following/followers_1.json</p>
            <p className="text-[#64748B]">connections/followers_and_following/following.json</p>
            <p className="mt-3 text-[#475569]"><strong>HTML format:</strong></p>
            <p className="text-[#64748B]">connections/followers_and_following/followers_1.html</p>
            <p className="text-[#64748B]">connections/followers_and_following/following.html</p>
          </div>

          <p className="text-[#475569] leading-relaxed">
            These are the files you'll upload to Unfollowr to see who doesn't follow you back.
          </p>

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
            <div className="mx-auto mb-4 inline-flex rounded-full bg-[#E8F0FE] p-3">
              <Download className="h-8 w-8 text-[#2f6bff]" />
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A]">Got your export files?</h2>
            <p className="mt-2 text-[#64748B]">
              Upload them to Unfollowr and see who doesn't follow you back in seconds.
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

