import clsx from "clsx";
export function Card({ className, children }: {className?: string; children: React.ReactNode}) {
  return (
    <div className={clsx(
      "rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}
