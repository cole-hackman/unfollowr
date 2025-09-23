export function LogoGlyph({ className="h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop stopColor="#2f6bff" offset="0" />
          <stop stopColor="#285be0" offset="1" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="16" fill="none" stroke="url(#g)" strokeWidth="4" />
      <path d="M38 38 L50 50" stroke="url(#g)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M18 38 L38 18" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
    </svg>
  );
}
