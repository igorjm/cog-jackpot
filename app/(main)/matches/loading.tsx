export default function MatchesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-7 w-32 bg-[#2A4A7A]/50 rounded-lg" />

      {/* Phase tabs */}
      <div className="flex gap-2 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-20 bg-[#2A4A7A]/40 rounded-full shrink-0" />
        ))}
      </div>

      {/* Match cards */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4 h-32" />
        ))}
      </div>
    </div>
  );
}
