export const metadata = {
  metadataBase: new URL("https://www.unfollowr.app"),
  title: "Instagram Unfollowers Tracker — Free, No Login | Unfollowr",
  description:
    "See who unfollows you on Instagram using your own data export. Unfollowr analyzes JSON/HTML offline\u2014no login, 100% private. Upload your Instagram export today.",
  keywords: [
    "instagram unfollowers",
    "who unfollowed me instagram",
    "instagram unfollower tracker",
    "check who unfollowed you instagram",
    "who doesn't follow me back instagram",
    "instagram follower tracker",
    "unfollowers checker no login",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Instagram Unfollowers Tracker — Free, No Login | Unfollowr",
    description:
      "See who unfollows you on Instagram using your own data export. Unfollowr analyzes JSON/HTML offline\u2014no login, 100% private. Upload your Instagram export today.",
    url: "https://www.unfollowr.app",
    siteName: "Unfollowr",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/unfollowr-logo.png",
        width: 1200,
        height: 630,
        alt: "Unfollowr - Instagram Unfollowers Tracker"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Unfollowers Tracker — Free, No Login | Unfollowr",
    description:
      "See who unfollows you on Instagram using your own data export. Unfollowr analyzes JSON/HTML offline\u2014no login, 100% private.",
    images: ["/unfollowr-logo.png"]
  },
  verification: {
    google: "O0MJUk7yjFtJMun5hsE-ZaV87yNPEAmidP6JjidrAY8"
  },
};

import "./globals.css";
import Script from "next/script";
import { AppChrome } from "@/components/AppChrome";
import { PageViewTracker } from "@/components/PageViewTracker";

// FAQ data for JSON-LD schema - must match visible FAQ content exactly
const faqSchemaData = [
  { question: "Is my Instagram data private and secure?", answer: "Yes. Unfollowr processes your files entirely in your browser. Nothing is uploaded to any server — your data stays on your device." },
  { question: "How is this safer than other unfollower apps?", answer: "Most apps require your Instagram login, which risks your account. Unfollowr uses Instagram's official data export instead — no passwords, no API access, no account risk." },
  { question: "How do I download my Instagram data?", answer: "Go to Instagram Settings → Accounts Center → Your information and permissions → Download your information. Select Followers and Following in JSON or HTML format." },
  { question: "Do I need to log into Instagram to use this?", answer: "No. You never enter your Instagram credentials. You only upload the data export files that Instagram gives you." },
  { question: "Does it work on mobile?", answer: "Yes. The upload and results pages work on any modern mobile browser. Just make sure you can access your Instagram export files on your device." }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="icon" href="/unfollowr-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/unfollowr-logo.png" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[color:var(--bg)] text-[color:var(--text)]">
        <PageViewTracker />
        <Script id="webpage-schema" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://www.unfollowr.app",
            url: "https://www.unfollowr.app",
            name: "Instagram Unfollowers Tracker \u2014 Free, No Login | Unfollowr",
            inLanguage: "en",
            description: "See who unfollowed you on Instagram using your data export. Free, no login, private, processed locally.",
            mainEntityOfPage: {
              "@id": "https://www.unfollowr.app",
              "@type": "WebPage"
            }
          })}
        </Script>
        <Script id="webapp-schema" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Unfollowr",
            url: "https://www.unfollowr.app",
            description: "Instagram unfollowers tracker that analyzes your Instagram data export locally in your browser to show who doesn't follow you back. No login, private, and runs entirely in-browser.",
            applicationCategory: "Utilities",
            operatingSystem: "All",
            featureList: [
              "Local processing in the browser",
              "Upload Instagram export (JSON or HTML)",
              "Instant results",
              "Smart analysis and categorization"
            ],
            provider: {
              "@type": "Organization",
              name: "Unfollowr",
              url: "https://www.unfollowr.app"
            }
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
        <Script id="howto-schema" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to see who doesn't follow you back on Instagram",
            description: "Use your Instagram data export to check unfollowers without login.",
            step: [
              { "@type": "HowToStep", name: "Download your Instagram export", text: "Go to Instagram Settings → Accounts Center → Download your information. Select Followers and Following (JSON or HTML)." },
              { "@type": "HowToStep", name: "Upload files to Unfollowr", text: "Upload your Followers and Following files to Unfollowr. Processing happens in your browser only." },
              { "@type": "HowToStep", name: "Local processing", text: "Unfollowr analyzes your data locally. Nothing is sent to any server." },
              { "@type": "HowToStep", name: "See who doesn't follow you back", text: "View the list of accounts that don't follow you back, with optional categories and export." }
            ]
          })}
        </Script>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
