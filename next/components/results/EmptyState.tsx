export function EmptyState({
  msg = "No results match your current filters.",
  action,
}: {
  msg?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-10 text-center text-[color:var(--text)]">
      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-[color:var(--text-faint)]">
        Nothing to show
      </div>
      <div className="max-w-md text-sm text-[color:var(--text-muted)]">{msg}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
