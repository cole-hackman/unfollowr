"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/Header";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
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
    </>
  );
}
