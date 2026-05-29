export default function RankingLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-7 w-36 bg-[#2A4A7A]/50 rounded-lg" />

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 py-4">
        <div className="w-20 h-24 bg-[#162D54] rounded-xl border border-[#2A4A7A]" />
        <div className="w-20 h-32 bg-[#162D54] rounded-xl border border-[#2A4A7A]" />
        <div className="w-20 h-20 bg-[#162D54] rounded-xl border border-[#2A4A7A]" />
      </div>

      {/* Table rows */}
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-3 h-14" />
        ))}
      </div>
    </div>
  );
}
