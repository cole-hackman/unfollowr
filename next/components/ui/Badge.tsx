import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  variant?: "neutral" | "primary" | "success" | "warning" | "danger";
  className?: string;
};

export function Badge({ children, variant = "neutral", className }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        variant === "neutral" && "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]",
        variant === "primary" && "border-transparent bg-[color:var(--primary-soft)] text-[color:var(--primary)]",
        variant === "success" && "border-transparent bg-[color:var(--success-soft)] text-[color:var(--success)]",
        variant === "warning" && "border-transparent bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
        variant === "danger" && "border-transparent bg-[color:var(--danger-soft)] text-[color:var(--danger)]",
        className
      )}
    >
      {children}
    </span>
  );
}
