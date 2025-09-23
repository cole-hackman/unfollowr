import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center">
        {/* Logo mark only */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Unfollowr home">
          <img src="/unfollowr-logo-clean.png" alt="Unfollowr" className="h-[4.5rem] w-auto" />
        </Link>
      </div>
    </header>
  );
}


