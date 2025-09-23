export const metadata = {
  title: "Unfollowr — Find who doesn’t follow back (private, fast)",
  description:
    "Drop your Instagram export to discover unfollowers instantly. Private, local-first analysis with optional AI labels.",
  openGraph: {
    title: "Unfollowr — Private unfollower analysis",
    description:
      "Drop your Instagram export to discover unfollowers instantly. Private, local-first analysis with optional AI labels.",
    type: "website"
  },
  twitter: { card: "summary_large_image" }
};

import './globals.css';
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-[#F7FAFC] text-[#0F172A]">
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
