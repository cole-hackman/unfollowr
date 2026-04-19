import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo mark only */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Unfollowr home">
          <img src="/wordmark.webp" alt="Unfollowr" className="h-[4.5rem] w-auto" />
        </Link>
        
        {/* Navigation links */}
        <nav className="flex items-center gap-6">
          <Link href="/guides" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Guides
          </Link>
          <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}


