export default function StatsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#2A4A7A]/50 rounded-lg" />
          <div className="h-3 w-32 bg-[#2A4A7A]/30 rounded" />
        </div>
        <div className="h-4 w-16 bg-[#2A4A7A]/30 rounded" />
      </div>

      {/* Hero skeleton */}
      <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4">
        <div className="h-3 w-36 bg-[#2A4A7A]/50 rounded mb-3" />
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-6 bg-[#2A4A7A]/40 rounded mx-auto w-8" />
              <div className="h-2 bg-[#2A4A7A]/30 rounded mx-auto w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Tab skeleton */}
      <div className="h-12 bg-[#162D54] rounded-xl border border-[#2A4A7A]" />

      {/* Chart cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4 space-y-3"
          >
            <div className="h-4 w-44 bg-[#2A4A7A]/50 rounded" />
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-1.5">
                <div className="h-4 bg-[#2A4A7A]/30 rounded w-full" />
                <div className="h-2 bg-[#2A4A7A]/20 rounded-full w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
