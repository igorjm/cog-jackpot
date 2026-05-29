export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-7 w-48 bg-[#2A4A7A]/50 rounded-lg" />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-4 space-y-2">
            <div className="h-6 w-12 bg-[#2A4A7A]/50 rounded mx-auto" />
            <div className="h-3 w-16 bg-[#2A4A7A]/30 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Next matches */}
      <div className="space-y-3">
        <div className="h-5 w-36 bg-[#2A4A7A]/50 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4 h-28" />
        ))}
      </div>
    </div>
  );
}
