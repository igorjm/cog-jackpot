interface StatHeroProps {
  finishedMatches: number;
  totalGoals: number;
  avgGoalsPerGame: number;
  drawPercentage: number;
  poolAccuracy: number;
}

export function StatHero({
  finishedMatches,
  totalGoals,
  avgGoalsPerGame,
  drawPercentage,
  poolAccuracy,
}: StatHeroProps) {
  const stats = [
    { value: finishedMatches, label: "Jogos", color: "text-white" },
    { value: totalGoals, label: "Gols", color: "text-[#22C55E]" },
    { value: avgGoalsPerGame, label: "Média/J", color: "text-[#38BDF8]" },
    { value: `${drawPercentage}%`, label: "Empates", color: "text-[#FFD60A]" },
    { value: `${poolAccuracy}%`, label: "Bolão", color: "text-[#A855F7]" },
  ];

  return (
    <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4">
      <p className="text-[10px] uppercase tracking-wide text-[#5A7A9A] mb-3">
        {finishedMatches > 0
          ? `${finishedMatches} jogos encerrados`
          : "Nenhum jogo encerrado ainda"}
      </p>
      <div className="grid grid-cols-5 gap-2 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className={`text-base sm:text-lg font-mono font-bold tabular-nums ${s.color}`}>
              {s.value}
            </p>
            <p className="text-[9px] sm:text-[10px] text-[#94B8D8]">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
