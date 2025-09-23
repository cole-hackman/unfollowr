export function EmptyState({ msg="🎉 Looks like no one fits that filter.", action }: { msg?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center text-[#0F172A]">
      <div className="text-lg text-[#0F172A]">{msg}</div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
