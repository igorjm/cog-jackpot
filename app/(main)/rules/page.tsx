import { POINTS, MULTIPLIERS, PRIZE_DISTRIBUTION, PHASE_LABELS } from "@/lib/constants";
import { PageTitle, SectionTitle } from "@/components/page-title";
import { PromoDerlisBanner } from "@/components/promo-derlis-banner";

export default function RulesPage() {
  const entryFee = process.env.NEXT_PUBLIC_ENTRY_FEE ?? "50.00";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageTitle icon="📖">Regras do Bolão</PageTitle>

      <section className="card-premium space-y-3 rounded-2xl p-5">
        <SectionTitle className="text-[#FACC15]">Sistema de Pontuação</SectionTitle>
        <div className="space-y-2">
          {[
            { label: "Placar exato", points: POINTS.EXACT_SCORE, example: "Palpitou 3×1, resultado 3×1" },
            { label: "Vencedor + 1 placar correto", points: POINTS.WINNER_PLUS_ONE_SCORE, example: "Palpitou 2×1, resultado 3×1" },
            { label: "Apenas vencedor correto", points: POINTS.CORRECT_WINNER, example: "Palpitou 1×0, resultado 3×1" },
            { label: "Empate correto", points: POINTS.CORRECT_DRAW, example: "Palpitou 1×1, resultado 2×2" },
            { label: "Acertou 1 placar (errou vencedor)", points: POINTS.ONE_SCORE_CORRECT, example: "Palpitou 0×1, resultado 3×1" },
            { label: "Errou tudo / não palpitou", points: POINTS.NONE, example: "" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between border-b border-white/10 py-2 last:border-0"
            >
              <div>
                <p className="text-sm text-white">{item.label}</p>
                {item.example && (
                  <p className="text-[10px] text-[#A8C3E8]">{item.example}</p>
                )}
              </div>
              <span className="font-mono font-bold text-[#FACC15]">
                {item.points} pts
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="card-premium space-y-3 rounded-2xl p-5">
        <SectionTitle className="text-[#FACC15]">Multiplicadores por Fase</SectionTitle>
        <div className="space-y-2">
          {(Object.entries(MULTIPLIERS) as [string, number][]).map(([phase, mult]) => (
            <div
              key={phase}
              className="flex items-center justify-between border-b border-white/10 py-2 last:border-0"
            >
              <span className="text-sm text-white">
                {PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}
              </span>
              <span className="font-mono font-bold text-[#FACC15]">{mult}×</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#A8C3E8]">
          Pontos do jogo × multiplicador = pontos finais creditados.
        </p>
      </section>

      <section className="card-premium space-y-3 rounded-2xl p-5">
        <SectionTitle className="text-[#FACC15]">Critérios de Desempate</SectionTitle>
        <ol className="list-decimal list-inside space-y-1 text-sm text-[#A8C3E8]">
          <li>Maior número de placares exatos</li>
          <li>Maior número de acertos de vencedor/empate</li>
          <li>Maior pontuação sem multiplicador</li>
          <li>Quem palpitou primeiro (data/hora do primeiro palpite)</li>
        </ol>
      </section>

      <section className="card-premium space-y-3 rounded-2xl p-5">
        <SectionTitle className="text-[#FACC15]">Premiação</SectionTitle>
        <p className="text-sm text-[#A8C3E8]">
          Cota de participação:{" "}
          <span className="font-bold text-[#FACC15]">R$ {entryFee}</span>
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 py-2">
            <span className="text-sm text-white">🥇 1º lugar</span>
            <span className="font-bold text-[#FACC15]">
              {PRIZE_DISTRIBUTION.first * 100}%
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 py-2">
            <span className="text-sm text-white">🥈 2º lugar</span>
            <span className="font-bold text-[#A8C3E8]">
              {PRIZE_DISTRIBUTION.second * 100}%
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white">🥉 3º lugar</span>
            <span className="font-bold text-[#F97316]">
              {PRIZE_DISTRIBUTION.third * 100}%
            </span>
          </div>
        </div>
      </section>

      <section className="card-premium space-y-3 rounded-2xl p-5">
        <SectionTitle className="text-[#FACC15]">Regras Gerais</SectionTitle>
        <ul className="space-y-2 text-sm text-[#A8C3E8]">
          <li>• Prazo para palpite: até 1 hora antes do jogo</li>
          <li>• 1 palpite por jogo (pode editar antes do prazo)</li>
          <li>• Palpites de outros participantes ficam ocultos até o prazo</li>
          <li>• Placar considerado: tempo regulamentar + prorrogação</li>
          <li>• Pênaltis NÃO contam no placar</li>
          <li>• Não palpitar = 0 pontos</li>
        </ul>
      </section>

      <PromoDerlisBanner />
    </div>
  );
}
