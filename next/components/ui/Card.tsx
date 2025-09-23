import clsx from "clsx";
export function Card({ className, children }: {className?: string; children: React.ReactNode}) {
  return (
    <div className={clsx(
      "rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]",
      className
    )}>
      {children}
    </div>
  );
}
