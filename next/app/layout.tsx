export const metadata = {
  metadataBase: new URL("https://www.unfollowr.app"),
  title: "Instagram Unfollowers Tracker — Free, No Login | Unfollowr",
  description:
    "See who unfollowed you on Instagram using your data export. Free, no login, private, processed locally in your browser.",
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
      "See who unfollowed you on Instagram with your data export. Free, private, no login.",
    url: "https://www.unfollowr.app",
    siteName: "Unfollowr",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/unfollowr-logo-new.png",
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
      "See who unfollowed you on Instagram. Free, private, no login.",
    images: ["/unfollowr-logo-new.png"]
  },
  verification: {
    google: "O0MJUk7yjFtJMun5hsE-ZaV87yNPEAmidP6JjidrAY8"
  },
};

import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";

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
        <link rel="icon" href="/unfollowr-logo-new.png" type="image/png" />
        <link rel="apple-touch-icon" href="/unfollowr-logo-new.png" />
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
        <Script id="webapp-schema" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Unfollowr",
            url: "https://www.unfollowr.app",
            description: "Check who unfollowed you on Instagram. Free unfollowers tracker & checker, no login, 100% private.",
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
        <div id="top" />
        <Header />
        {children}
        <footer className="mt-16 border-t border-[color:var(--border)] bg-[color:var(--surface)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-5 text-sm text-[color:var(--text-muted)]">
            <span>© {new Date().getFullYear()} Unfollowr</span>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="transition hover:text-[color:var(--text)] hover:underline">
                Privacy
              </a>
              <a href="/terms" className="transition hover:text-[color:var(--text)] hover:underline">
                Terms
              </a>
              <a
                href="mailto:hello@unfollowr.app"
                className="transition hover:text-[color:var(--text)] hover:underline"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
