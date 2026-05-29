export default function MyBetsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-7 w-40 bg-[#2A4A7A]/50 rounded-lg" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 space-y-2">
            <div className="h-6 w-10 bg-[#2A4A7A]/50 rounded mx-auto" />
            <div className="h-3 w-14 bg-[#2A4A7A]/30 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Bet rows */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 h-16" />
        ))}
      </div>
    </div>
  );
}
