import clsx from "clsx";

type Props = {
  title?: string;
  children?: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  className?: string;
  action?: React.ReactNode;
};

export function Alert({ title, children, variant = "info", className, action }: Props) {
  const styles =
    variant === "success"
      ? "border-[color:var(--success)] bg-[color:var(--success-soft)] text-[color:var(--text)]"
      : variant === "warning"
        ? "border-[color:var(--warning)] bg-[color:var(--warning-soft)] text-[color:var(--text)]"
        : variant === "danger"
          ? "border-[color:var(--danger)] bg-[color:var(--danger-soft)] text-[color:var(--text)]"
          : "border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text)]";

  return (
    <div
      role="status"
      className={clsx(
        "rounded-[var(--r-lg)] border p-4 shadow-sm",
        styles,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {children && <div className={clsx("text-sm", title && "mt-1 text-[color:var(--text-muted)]")}>{children}</div>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

