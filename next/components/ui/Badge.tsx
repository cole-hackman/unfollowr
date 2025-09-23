export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#475569]">
      {children}
    </span>
  );
}
