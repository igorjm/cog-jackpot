export default function StatsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-40 bg-[#2A4A7A]/50 rounded-lg" />
      {/* My stats card */}
      <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4 h-24" />
      {/* Stat sections */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4 space-y-3">
          <div className="h-4 w-44 bg-[#2A4A7A]/50 rounded" />
          {[...Array(3)].map((_, j) => (
            <div key={j} className="h-5 bg-[#2A4A7A]/30 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
