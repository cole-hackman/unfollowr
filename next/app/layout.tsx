export const metadata = {
  metadataBase: new URL("https://unfollowr.app"),
  title: "Instagram Unfollowers Tool (Free & Safe) – No Login | Unfollowr",
  description:
    "Track Instagram unfollowers and see who doesn't follow you back. Unfollowr is a free, private unfollower tool with no login and local processing.",
  openGraph: {
    title: "Instagram Unfollowers Tool (Free & Safe) – No Login | Unfollowr",
    description:
      "Track Instagram unfollowers and see who doesn't follow you back. Free, private, no login required.",
    url: "https://unfollowr.app",
    type: "website",
    images: [
      {
        url: "/unfollowr-logo-new.png",
        width: 1200,
        height: 630,
        alt: "Unfollowr - Instagram Unfollowers Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Unfollowers Tool (Free & Safe) – No Login | Unfollowr",
    description:
      "Track Instagram unfollowers and see who doesn't follow you back. Free, private, no login required.",
    images: ["/unfollowr-logo-new.png"]
  },
  verification: {
    google: "O0MJUk7yjFtJMun5hsE-ZaV87yNPEAmidP6JjidrAY8"
  }
};

import './globals.css';
import Script from 'next/script';
import Header from "@/components/Header";

// FAQ data for JSON-LD schema - must match visible FAQ content exactly
const faqSchemaData = [
  {
    question: "Is my Instagram data private and secure?",
    answer: "Yes, absolutely. Unfollowr processes all your Instagram export files locally in your browser. We don't upload, store, or transmit your data to any server. Your follower information never leaves your device, making this the safest way to track Instagram unfollowers."
  },
  {
    question: "How is Unfollowr safer than other unfollower apps?",
    answer: "Unlike most Instagram unfollower tools, we never ask for your Instagram login credentials. Many third-party apps require your password, which violates Instagram's terms of service and puts your account at risk. Unfollowr uses your official Instagram data export instead, keeping your account completely safe."
  },
  {
    question: "What information does Unfollowr collect or store?",
    answer: "None of your Instagram export files or follower data is uploaded or stored. We may collect anonymous usage metrics like button clicks to improve the product, but we never access, store, or have visibility into your Instagram data. Everything is processed client-side in your browser."
  },
  {
    question: "How can I see who unfollowed me on Instagram?",
    answer: "To see who unfollowed you on Instagram, first download your Instagram data export from Settings → Accounts Center → Your information and permissions → Download your information. Select Followers and Following, then upload both files to Unfollowr. We'll instantly show you everyone who doesn't follow you back."
  },
  {
    question: "How do I download my Instagram followers data?",
    answer: "Open Instagram, go to Settings, then Accounts Center. Select \"Your information and permissions\" and tap \"Download your information.\" Choose your Instagram account, select \"Some of your information,\" and pick Followers and Following. Choose JSON or HTML format, then request your download. Instagram will email you when it's ready."
  },
  {
    question: "Do I need to log into Instagram to use Unfollowr?",
    answer: "No, you never need to log into Instagram through Unfollowr. We don't ask for your username, password, or any login credentials. Instead, you simply upload the data export files that Instagram provides directly to you. This keeps your account secure and compliant with Instagram's policies."
  },
  {
    question: "Does Unfollowr work on mobile phones and tablets?",
    answer: "Yes, Unfollowr is fully responsive and works on all devices including iPhones, Android phones, iPads, and desktop browsers. You can upload your Instagram export files from any device and get instant results showing who doesn't follow you back."
  },
  {
    question: "Is it safe to use Instagram unfollower tools?",
    answer: "It depends on the tool. Many unfollower apps ask for your Instagram login, which can get your account flagged or banned. Unfollowr is different—we never access your Instagram account directly. We only analyze the data export that Instagram officially provides, making it completely safe and compliant with Instagram's terms of service."
  }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-[#F7FAFC] text-[#0F172A]">
        <Script id="webapp-schema" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Unfollowr",
            url: "https://unfollowr.app",
            description: "Instagram unfollower tool. Track unfollowers privately without login.",
            applicationCategory: "SocialNetworkingApplication",
            operatingSystem: "Web"
          })}
        </Script>
        <Script id="faq-schema" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqSchemaData.map(item => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer
              }
            }))
          })}
        </Script>
        <div id="top" />
        <Header />
        {children}
        <footer className="mt-16 border-t border-white/10 bg-white/5">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4 text-sm text-white/70">
            <span className="text-[#475569]">© {new Date().getFullYear()} Unfollowr</span>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-[#475569] hover:underline">Privacy</a>
              <a href="/terms" className="text-[#475569] hover:underline">Terms</a>
              <a href="mailto:hello@unfollowr.app" className="text-[#475569] hover:underline">Contact</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
