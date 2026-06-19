"use client";

import { useState } from "react";
import type { TournamentStats, PoolStats } from "@/lib/stats";
import { StatHero } from "./stat-hero";
import { StatCard, EmptyChart } from "./stat-card";
import { HorizontalBarChart } from "./horizontal-bar-chart";
import {
  StackedBarChart,
  StackedBarLegend,
  HomeAwayBar,
} from "./stacked-bar-chart";
import {
  LeaderboardBars,
  MyStatsCard,
  PoolAccuracyBar,
} from "./leaderboard-bars";
import { GroupStandings } from "./group-standings";
import { TeamGoalsChart } from "./team-goals-chart";
import { ScoreBiasChart } from "./score-bias-chart";

type Tab = "copa" | "bolao";

interface StatsTabsProps {
  tournament: TournamentStats;
  pool: PoolStats;
}

export function StatsTabs({ tournament, pool }: StatsTabsProps) {
  const [tab, setTab] = useState<Tab>("copa");
  const { summary } = tournament;
  const hasMatches = summary.finishedMatches > 0;

  return (
    <div className="space-y-4">
      <StatHero
        finishedMatches={summary.finishedMatches}
        totalGoals={summary.totalGoals}
        avgGoalsPerGame={summary.avgGoalsPerGame}
        drawPercentage={summary.drawPercentage}
        poolAccuracy={pool.poolAccuracy}
      />

      {/* Tab switcher */}
      <div className="sticky top-0 z-10 bg-[#0F2347]/95 backdrop-blur-sm py-1 -mx-1 px-1">
        <div className="flex rounded-xl bg-[#162D54] border border-[#2A4A7A] p-1">
          <button
            type="button"
            onClick={() => setTab("copa")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all min-h-[44px] ${
              tab === "copa"
                ? "bg-[#FFD60A] text-[#0F2347]"
                : "text-[#94B8D8] hover:text-white"
            }`}
          >
            🌍 Copa
          </button>
          <button
            type="button"
            onClick={() => setTab("bolao")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all min-h-[44px] ${
              tab === "bolao"
                ? "bg-[#FFD60A] text-[#0F2347]"
                : "text-[#94B8D8] hover:text-white"
            }`}
          >
            🎯 Bolão
          </button>
        </div>
      </div>

      {tab === "copa" ? (
        <CopaTab tournament={tournament} hasMatches={hasMatches} />
      ) : (
        <BolaoTab pool={pool} />
      )}
    </div>
  );
}

function CopaTab({
  tournament,
  hasMatches,
}: {
  tournament: TournamentStats;
  hasMatches: boolean;
}) {
  return (
    <div className="space-y-4">
      {!hasMatches ? (
        <StatCard title="Estatísticas da Copa">
          <EmptyChart />
        </StatCard>
      ) : (
        <>
          {tournament.summary.highestScoringMatch && (
            <StatCard
              title="Jogo mais gols"
              subtitle="Maior placar da competição"
            >
              <p className="text-sm text-white text-center py-2">
                {tournament.summary.highestScoringMatch.label}
                <span className="ml-2 font-mono text-[#FFD60A]">
                  ({tournament.summary.highestScoringMatch.goals} gols)
                </span>
              </p>
            </StatCard>
          )}

          {tournament.groupStandings.length > 0 && (
            <StatCard
              title="Classificação dos Grupos"
              subtitle="Baseado nos jogos encerrados"
            >
              <GroupStandings groups={tournament.groupStandings} />
            </StatCard>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournament.topScorers.length > 0 && (
              <StatCard title="Artilharia" subtitle="Gols marcados">
                <TeamGoalsChart teams={tournament.topScorers} mode="attack" />
              </StatCard>
            )}

            {tournament.bestDefense.length > 0 && (
              <StatCard title="Melhor Defesa" subtitle="Menos gols sofridos (min. 2 jogos)">
                <TeamGoalsChart teams={tournament.bestDefense} mode="defense" />
              </StatCard>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Resultados por Confederação"
              subtitle="Vitórias, empates e derrotas"
              legend={<StackedBarLegend />}
            >
              <StackedBarChart items={tournament.confederations} />
            </StatCard>

            <StatCard
              title="Placares mais frequentes"
              subtitle="Resultados reais dos jogos"
            >
              <HorizontalBarChart items={tournament.scoreFrequency} />
            </StatCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard title="Gols por fase" subtitle="Total de gols por fase">
              {tournament.goalsByPhase.length > 0 ? (
                <HorizontalBarChart
                  items={tournament.goalsByPhase}
                  showRank={false}
                  rawValue
                />
              ) : (
                <EmptyChart />
              )}
            </StatCard>

            <StatCard
              title="Mandante vs Visitante"
              subtitle="Quem vence mais?"
            >
              <HomeAwayBar {...tournament.homeAway} />
            </StatCard>
          </div>
        </>
      )}
    </div>
  );
}

function BolaoTab({ pool }: { pool: PoolStats }) {
  const hasBets = pool.topExact.length > 0 || pool.poolAccuracy > 0;

  return (
    <div className="space-y-4">
      {pool.myStats && (
        <StatCard title="Minhas Estatísticas" subtitle="Comparado à média do bolão">
          <MyStatsCard stats={pool.myStats} />
        </StatCard>
      )}

      <StatCard title="Aproveitamento do Bolão" subtitle="Palpites com vencedor correto">
        <PoolAccuracyBar accuracy={pool.poolAccuracy} />
      </StatCard>

      {!hasBets ? (
        <StatCard title="Estatísticas do Bolão">
          <EmptyChart message="Nenhum palpite pontuado ainda" />
        </StatCard>
      ) : (
        <>
          {pool.pointsDistribution.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard title="Distribuição de Pontos" subtitle="Por palpite pontuado">
                <HorizontalBarChart
                  items={pool.pointsDistribution}
                  showRank={false}
                  rawValue
                />
              </StatCard>

              <StatCard title="Cenários de Pontuação" subtitle="Como o bolão pontua">
                <HorizontalBarChart
                  items={pool.scenarioDistribution}
                  showRank={false}
                  rawValue
                />
              </StatCard>
            </div>
          )}

          <StatCard title="Mais Cravadas" subtitle="Placares exatos">
            <LeaderboardBars items={pool.topExact} />
          </StatCard>

          <StatCard title="Maiores Sequências" subtitle="Acertos consecutivos">
            <LeaderboardBars
              items={pool.topStreaks}
              valueSuffix=" seguidos"
            />
          </StatCard>

          <StatCard title="Mestres do Empate" subtitle="Empates acertados">
            <LeaderboardBars
              items={pool.topDrawMasters}
              valueSuffix=" empates"
            />
          </StatCard>

          <StatCard title="Placares Mais Apostados" subtitle="Palpites do bolão">
            <LeaderboardBars
              items={pool.topBetScores}
              valueSuffix=" vezes"
              medals={false}
            />
          </StatCard>

          {pool.performanceByPhase.length > 0 && (
            <StatCard
              title="Desempenho por Fase"
              subtitle="Média de pontos por palpite"
            >
              <HorizontalBarChart
                items={pool.performanceByPhase}
                showRank={false}
                valueSuffix="pts"
                rawValue
              />
            </StatCard>
          )}

          {pool.betVsReality && (
            <StatCard
              title="Palpite vs Realidade"
              subtitle="Viés do bolão: o que apostamos vs o que acontece"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-[#0F2347] rounded-xl">
                  <p className="text-[10px] text-[#5A7A9A] uppercase mb-1">
                    Mais apostado
                  </p>
                  <p className="text-lg font-mono font-bold text-[#38BDF8]">
                    {pool.betVsReality.mostBetScore}
                  </p>
                  <p className="text-xs text-[#94B8D8]">
                    {pool.betVsReality.mostBetCount} palpites
                  </p>
                </div>
                <div className="text-center p-3 bg-[#0F2347] rounded-xl">
                  <p className="text-[10px] text-[#5A7A9A] uppercase mb-1">
                    Mais frequente
                  </p>
                  <p className="text-lg font-mono font-bold text-[#22C55E]">
                    {pool.betVsReality.mostActualScore}
                  </p>
                  <p className="text-xs text-[#94B8D8]">
                    {pool.betVsReality.mostActualCount} jogos
                  </p>
                </div>
              </div>
              <ScoreBiasChart
                outcomeBias={pool.betVsReality.outcomeBias}
                scoreBias={pool.betVsReality.scoreBias}
              />
            </StatCard>
          )}

          {pool.biggestCollectiveMiss && (
            <StatCard
              title="Maior Erro Coletivo"
              subtitle="Jogo onde menos gente pontuou"
            >
              <div className="text-center py-3">
                <p className="text-sm text-white mb-2">
                  {pool.biggestCollectiveMiss.matchLabel}
                </p>
                <p className="text-2xl font-mono font-bold text-[#EF4444]">
                  {pool.biggestCollectiveMiss.zeroPointRate}%
                </p>
                <p className="text-xs text-[#94B8D8] mt-1">
                  zeraram ({pool.biggestCollectiveMiss.betCount} palpites)
                </p>
              </div>
            </StatCard>
          )}
        </>
      )}
    </div>
  );
}
