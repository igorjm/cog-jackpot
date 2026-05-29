import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function StatsPage() {
  const session = await auth();

  const bets = await prisma.bet.findMany({
    where: {
      points: { not: null },
      match: { phase: { not: "FRIENDLY" } },
    },
    include: {
      match: { select: { homeTeam: true, awayTeam: true, phase: true } },
      user: { select: { id: true, nickname: true } },
    },
  });

  // Most exact scores
  const exactByUser = new Map<string, { nickname: string; count: number }>();
  // Most common bet score
  const scoreCounts = new Map<string, number>();
  // Longest streak per user
  const userBets = new Map<string, { nickname: string; bets: { points: number; createdAt: Date }[] }>();

  for (const bet of bets) {
    const uid = bet.userId;
    const nick = bet.user.nickname ?? "Anônimo";

    // Exact scores
    if (bet.rawPoints === 10) {
      const prev = exactByUser.get(uid) ?? { nickname: nick, count: 0 };
      exactByUser.set(uid, { nickname: nick, count: prev.count + 1 });
    }

    // Score frequency
    const scoreKey = `${bet.homeScore}×${bet.awayScore}`;
    scoreCounts.set(scoreKey, (scoreCounts.get(scoreKey) ?? 0) + 1);

    // Streaks
    if (!userBets.has(uid)) {
      userBets.set(uid, { nickname: nick, bets: [] });
    }
    userBets.get(uid)!.bets.push({ points: bet.points ?? 0, createdAt: bet.createdAt });
  }

  // Top exact scorers
  const topExact = [...exactByUser.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  // Most popular scores
  const topScores = [...scoreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Longest winning streaks (points > 0)
  const streaks: { nickname: string; streak: number }[] = [];
  for (const [, data] of userBets) {
    const sorted = data.bets.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    let maxStreak = 0;
    let current = 0;
    for (const b of sorted) {
      if (b.points > 0) {
        current++;
        maxStreak = Math.max(maxStreak, current);
      } else {
        current = 0;
      }
    }
    streaks.push({ nickname: data.nickname, streak: maxStreak });
  }
  const topStreaks = streaks.sort((a, b) => b.streak - a.streak).slice(0, 5);

  // Draw masters (most correct draws)
  const drawByUser = new Map<string, { nickname: string; count: number }>();
  for (const bet of bets) {
    if (bet.homeScore === bet.awayScore && bet.rawPoints && bet.rawPoints >= 5) {
      const uid = bet.userId;
      const nick = bet.user.nickname ?? "Anônimo";
      const prev = drawByUser.get(uid) ?? { nickname: nick, count: 0 };
      drawByUser.set(uid, { nickname: nick, count: prev.count + 1 });
    }
  }
  const topDrawMasters = [...drawByUser.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  // Current user stats
  const myBets = bets.filter((b) => b.userId === session?.user?.id);
  const myExacts = myBets.filter((b) => b.rawPoints === 10).length;
  const myTotal = myBets.reduce((s, b) => s + (b.points ?? 0), 0);
  const myAccuracy = myBets.length > 0
    ? Math.round((myBets.filter((b) => (b.rawPoints ?? 0) >= 5).length / myBets.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
          📊 Estatísticas
        </h1>
        <Link
          href="/ranking"
          className="text-xs text-[#38BDF8] hover:underline"
        >
          ← Ranking
        </Link>
      </div>

      {/* My Stats */}
      {session?.user && (
        <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4">
          <h2 className="text-sm font-bold text-[#FFD60A] mb-3 font-[family-name:var(--font-oswald)] uppercase">
            Minhas Estatísticas
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-mono font-bold text-[#22C55E]">{myTotal}</p>
              <p className="text-[10px] text-[#94B8D8]">Pontos</p>
            </div>
            <div>
              <p className="text-lg font-mono font-bold text-[#FFD60A]">{myExacts}</p>
              <p className="text-[10px] text-[#94B8D8]">Cravadas</p>
            </div>
            <div>
              <p className="text-lg font-mono font-bold text-[#38BDF8]">{myAccuracy}%</p>
              <p className="text-[10px] text-[#94B8D8]">Aproveit.</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Exact Scorers */}
      <StatSection title="🎯 Mais Cravadas" emoji="🎯">
        {topExact.map(([, { nickname, count }], i) => (
          <StatRow key={i} rank={i + 1} label={nickname} value={`${count}`} />
        ))}
        {topExact.length === 0 && <EmptyState />}
      </StatSection>

      {/* Longest Streaks */}
      <StatSection title="🔥 Maiores Sequências de Acertos" emoji="🔥">
        {topStreaks.map((s, i) => (
          <StatRow key={i} rank={i + 1} label={s.nickname} value={`${s.streak} seguidos`} />
        ))}
        {topStreaks.length === 0 && <EmptyState />}
      </StatSection>

      {/* Draw Masters */}
      <StatSection title="🤝 Mestres do Empate" emoji="🤝">
        {topDrawMasters.map(([, { nickname, count }], i) => (
          <StatRow key={i} rank={i + 1} label={nickname} value={`${count} empates`} />
        ))}
        {topDrawMasters.length === 0 && <EmptyState />}
      </StatSection>

      {/* Most Popular Scores */}
      <StatSection title="📈 Placares Mais Apostados" emoji="📈">
        {topScores.map(([score, count], i) => (
          <StatRow key={i} rank={i + 1} label={score} value={`${count} vezes`} />
        ))}
        {topScores.length === 0 && <EmptyState />}
      </StatSection>
    </div>
  );
}

function StatSection({ title, children }: { title: string; emoji?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4">
      <h2 className="text-sm font-bold text-[#FFD60A] mb-3 font-[family-name:var(--font-oswald)] uppercase">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StatRow({ rank, label, value }: { rank: number; label: string; value: string }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className="w-6 text-center">{medals[rank - 1] ?? `${rank}.`}</span>
        <span className="text-white">{label}</span>
      </div>
      <span className="font-mono text-[#94B8D8]">{value}</span>
    </div>
  );
}

function EmptyState() {
  return <p className="text-xs text-[#5A7A9A] text-center py-2">Nenhum dado ainda</p>;
}
