import { POINTS, MULTIPLIERS, PRIZE_DISTRIBUTION, PHASE_LABELS, PREDICTION_POINTS } from "@/lib/constants";

export default function RulesPage() {
  const entryFee = process.env.NEXT_PUBLIC_ENTRY_FEE ?? "50.00";

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        📖 Regras do Bolão
      </h1>

      {/* Scoring */}
      <section className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase text-[#FFD60A] tracking-wide">
          Sistema de Pontuação
        </h2>
        <div className="space-y-2">
          {[
            { label: "Placar exato", points: POINTS.EXACT_SCORE, example: "Palpitou 3×1, resultado 3×1" },
            { label: "Vencedor + 1 placar correto", points: POINTS.WINNER_PLUS_ONE_SCORE, example: "Palpitou 2×1, resultado 3×1" },
            { label: "Apenas vencedor correto", points: POINTS.CORRECT_WINNER, example: "Palpitou 1×0, resultado 3×1" },
            { label: "Empate correto", points: POINTS.CORRECT_DRAW, example: "Palpitou 1×1, resultado 2×2" },
            { label: "Acertou 1 placar (errou vencedor)", points: POINTS.ONE_SCORE_CORRECT, example: "Palpitou 0×1, resultado 3×1" },
            { label: "Errou tudo / não palpitou", points: POINTS.NONE, example: "" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#2A4A7A] last:border-0">
              <div>
                <p className="text-sm">{item.label}</p>
                {item.example && (
                  <p className="text-[10px] text-[#94B8D8]">{item.example}</p>
                )}
              </div>
              <span className="font-mono font-bold text-[#22C55E]">
                {item.points} pts
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Multipliers */}
      <section className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase text-[#FFD60A] tracking-wide">
          Multiplicadores por Fase
        </h2>
        <div className="space-y-2">
          {(Object.entries(MULTIPLIERS) as [string, number][]).map(([phase, mult]) => (
            <div key={phase} className="flex items-center justify-between py-2 border-b border-[#2A4A7A] last:border-0">
              <span className="text-sm">{PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}</span>
              <span className="font-mono font-bold text-[#FFD60A]">{mult}×</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#94B8D8]">
          Pontos finais = pontos do jogo × multiplicador (sem arredondamento).
          Ex.: 7 pts × 1,25 = <strong className="text-white">8,75 pts</strong>.
        </p>
      </section>

      {/* Tiebreakers */}
      <section className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase text-[#FFD60A] tracking-wide">
          Critérios de Desempate
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-[#94B8D8]">
          <li>Maior número de placares exatos</li>
          <li>Maior número de acertos de vencedor/empate</li>
          <li>Maior pontuação sem multiplicador</li>
          <li>Quem palpitou primeiro (data/hora do primeiro palpite)</li>
        </ol>
      </section>

      {/* Predictions Bonus */}
      <section className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase text-[#FFD60A] tracking-wide">
          🏆 Palpites Especiais
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-[#2A4A7A]">
            <span className="text-sm">Acertar o Campeão do Mundo</span>
            <span className="font-mono font-bold text-[#22C55E]">+{PREDICTION_POINTS} pts</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Acertar o Artilheiro da Copa</span>
            <span className="font-mono font-bold text-[#22C55E]">+{PREDICTION_POINTS} pts</span>
          </div>
        </div>
        <p className="text-xs text-[#94B8D8]">
          Prazo: até o início do primeiro jogo da fase de grupos. Pontos NÃO recebem multiplicador.
        </p>
      </section>

      {/* Prizes */}
      <section className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase text-[#FFD60A] tracking-wide">
          Premiação
        </h2>
        <p className="text-sm text-[#94B8D8]">
          Cota de participação: <span className="text-[#FFD60A] font-bold">R$ {entryFee}</span>
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-[#2A4A7A]">
            <span className="text-sm">🥇 1º lugar</span>
            <span className="font-bold text-[#FFD60A]">{PRIZE_DISTRIBUTION.first * 100}%</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#2A4A7A]">
            <span className="text-sm">🥈 2º lugar</span>
            <span className="font-bold text-[#94B8D8]">{PRIZE_DISTRIBUTION.second * 100}%</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">🥉 3º lugar</span>
            <span className="font-bold text-[#F97316]">{PRIZE_DISTRIBUTION.third * 100}%</span>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase text-[#FFD60A] tracking-wide">
          Regras Gerais
        </h2>
        <ul className="space-y-2 text-sm text-[#94B8D8]">
          <li>• Prazo para palpite: até 1 hora antes do jogo</li>
          <li>• 1 palpite por jogo (pode editar antes do prazo)</li>
          <li>• Palpites de outros participantes ficam ocultos até o prazo</li>
          <li>• Placar considerado: tempo regulamentar + prorrogação</li>
          <li>• Pênaltis NÃO contam no placar</li>
          <li>• Não palpitar = 0 pontos</li>
        </ul>
      </section>
    </div>
  );
}
