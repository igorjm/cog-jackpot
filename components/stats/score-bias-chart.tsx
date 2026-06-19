import type { OutcomeBias, ScoreBiasEntry } from "@/lib/stats";

interface ScoreBiasChartProps {
  outcomeBias: OutcomeBias;
  scoreBias: ScoreBiasEntry[];
}

function OutcomeRow({
  label,
  betPct,
  actualPct,
}: {
  label: string;
  betPct: number;
  actualPct: number;
}) {
  const diff = betPct - actualPct;
  const diffLabel =
    diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : "0%";

  return (
    <div className="space-y-1.5 min-h-[44px]">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white font-medium">{label}</span>
        <span
          className={`font-mono tabular-nums ${
            diff > 5
              ? "text-[#F97316]"
              : diff < -5
              ? "text-[#38BDF8]"
              : "text-[#94B8D8]"
          }`}
        >
          {diffLabel}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#5A7A9A] w-12 shrink-0">Palpite</span>
          <div className="flex-1 h-1.5 bg-[#0F2347] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#38BDF8] rounded-full"
              style={{ width: `${betPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#94B8D8] w-8 text-right tabular-nums">
            {betPct}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#5A7A9A] w-12 shrink-0">Real</span>
          <div className="flex-1 h-1.5 bg-[#0F2347] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full"
              style={{ width: `${actualPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#94B8D8] w-8 text-right tabular-nums">
            {actualPct}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function ScoreBiasChart({ outcomeBias, scoreBias }: ScoreBiasChartProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3" role="img" aria-label="Viés de resultados">
        <OutcomeRow
          label="Empates"
          betPct={outcomeBias.draws.betPct}
          actualPct={outcomeBias.draws.actualPct}
        />
        <OutcomeRow
          label="Vitória mandante"
          betPct={outcomeBias.homeWins.betPct}
          actualPct={outcomeBias.homeWins.actualPct}
        />
        <OutcomeRow
          label="Vitória visitante"
          betPct={outcomeBias.awayWins.betPct}
          actualPct={outcomeBias.awayWins.actualPct}
        />
      </div>

      {scoreBias.length > 0 && (
        <div className="pt-3 border-t border-[#2A4A7A]/50">
          <p className="text-[10px] text-[#5A7A9A] uppercase mb-2">
            Placares com maior viés
          </p>
          <div className="space-y-2">
            {scoreBias.map((entry) => (
              <div
                key={entry.score}
                className="flex items-center justify-between text-xs"
              >
                <span className="font-mono text-white">{entry.score}</span>
                <span className="text-[#94B8D8] tabular-nums">
                  palpite {entry.betPct}% · real {entry.actualPct}%
                </span>
                <span
                  className={`font-mono tabular-nums shrink-0 ${
                    entry.diff > 0 ? "text-[#F97316]" : "text-[#38BDF8]"
                  }`}
                >
                  {entry.diff > 0 ? "+" : ""}
                  {entry.diff}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 text-[10px] text-[#5A7A9A]">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#38BDF8]" /> Palpite
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" /> Real
        </span>
        <span className="text-[#F97316]">+ superestimado</span>
      </div>
    </div>
  );
}
