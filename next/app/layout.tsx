export const metadata = {
  metadataBase: new URL("https://unfollowr.app"),
  title: "Instagram Unfollower Tool – Track & Remove Unfollowers Safely",
  description:
    "Unfollowr is the safe Instagram unfollower tool. Track who unfollowed you, remove followers, and monitor growth — private, fast, no login required.",
  openGraph: {
    title: "Instagram Unfollower Tool – Unfollowr",
    description:
      "Track Instagram unfollowers privately and safely. No login required.",
    url: "https://unfollowr.app",
    type: "website",
    images: [
      {
        url: "/unfollowr-logo-new.png",
        width: 1200,
        height: 630,
        alt: "Unfollowr"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Unfollower Tool – Unfollowr",
    description:
      "Track Instagram unfollowers privately and safely. No login required.",
    images: ["/unfollowr-logo-new.png"]
  },
  verification: {
    google: "O0MJUk7yjFtJMun5hsE-ZaV87yNPEAmidP6JjidrAY8"
  }
};

import './globals.css';
import Script from 'next/script';
import Header from "@/components/Header";

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
        <div id="top" />
        <Header />
        {children}
        <footer className="mt-16 border-t border-white/10 bg-white/5">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4 text-sm text-white/70">
            <span className="text-[#475569]">© {new Date().getFullYear()} Unfollowr</span>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-[#475569] hover:underline">Privacy</a>
              <a href="#terms" className="text-[#475569] hover:underline">Terms</a>
              <a href="mailto:hello@unfollowr.app" className="text-[#475569] hover:underline">Contact</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
