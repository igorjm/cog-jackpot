import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { calculateRanking } from "@/lib/ranking";
import { PRIZE_DISTRIBUTION } from "@/lib/constants";
import { SendNotificationForm } from "@/components/test-notification-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const totalUsers = await prisma.user.count({ where: { role: { not: "ADMIN" } } });
  const approvedUsers = await prisma.user.count({ where: { status: "APPROVED", role: { not: "ADMIN" } } });
  const pendingUsers = await prisma.user.count({ where: { status: "PENDING_PAYMENT", role: { not: "ADMIN" } } });
  const entryFee = parseFloat(process.env.NEXT_PUBLIC_ENTRY_FEE ?? "50");
  const totalAmount = approvedUsers * entryFee;

  const matchesWithoutResult = await prisma.match.count({
    where: { homeScore: null, matchDate: { lt: new Date() } },
  });

  const ranking = await calculateRanking();

  const prizes = [
    { label: "🥇 1º Lugar", pct: PRIZE_DISTRIBUTION.first, amount: totalAmount * PRIZE_DISTRIBUTION.first },
    { label: "🥈 2º Lugar", pct: PRIZE_DISTRIBUTION.second, amount: totalAmount * PRIZE_DISTRIBUTION.second },
    { label: "🥉 3º Lugar", pct: PRIZE_DISTRIBUTION.third, amount: totalAmount * PRIZE_DISTRIBUTION.third },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        Dashboard Admin
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Inscritos" value={totalUsers.toString()} />
        <StatCard label="Aprovados" value={approvedUsers.toString()} color="text-[#22C55E]" />
        <StatCard label="Pendentes" value={pendingUsers.toString()} color="text-[#FFD60A]" />
        <StatCard label="Montante" value={formatCurrency(totalAmount)} color="text-[#FFD60A]" />
      </div>

      {matchesWithoutResult > 0 && (
        <div className="bg-[#162D54] rounded-xl border border-[#FFD60A]/30 p-4">
          <p className="text-sm">
            ⚠️ <span className="font-medium">{matchesWithoutResult} jogo(s)</span> já
            aconteceram mas ainda não têm resultado inserido.
          </p>
        </div>
      )}

      {/* Push Notifications */}
      <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-4">
        <h2 className="text-sm font-bold font-[family-name:var(--font-oswald)] uppercase text-[#FFD60A] mb-3">
          Enviar Notificação
        </h2>
        <SendNotificationForm />
      </div>

      {/* Prize Distribution */}
      <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-4">
        <h2 className="text-sm font-bold font-[family-name:var(--font-oswald)] uppercase text-[#FFD60A] mb-3">
          Distribuição de Prêmios
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {prizes.map((p) => (
            <div key={p.label} className="text-center">
              <p className="text-xs text-[#94B8D8]">{p.label}</p>
              <p className="text-sm font-mono font-bold text-white">{formatCurrency(p.amount)}</p>
              <p className="text-[10px] text-[#5A7A9A]">{(p.pct * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking Table */}
      <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-4">
        <h2 className="text-sm font-bold font-[family-name:var(--font-oswald)] uppercase text-[#FFD60A] mb-3">
          Ranking Atual
        </h2>
        {ranking.length === 0 ? (
          <p className="text-sm text-[#94B8D8] text-center py-4">
            Nenhum resultado registrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#5A7A9A] text-xs border-b border-[#2A4A7A]">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2">Jogador</th>
                  <th className="text-right py-2">Pts</th>
                  <th className="text-right py-2">CE</th>
                  <th className="text-right py-2 hidden sm:table-cell">Prêmio</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry) => {
                  const prize =
                    entry.position === 1
                      ? prizes[0].amount
                      : entry.position === 2
                        ? prizes[1].amount
                        : entry.position === 3
                          ? prizes[2].amount
                          : null;

                  return (
                    <tr
                      key={entry.userId}
                      className={`border-b border-[#2A4A7A]/50 ${entry.position <= 3 ? "text-white" : "text-[#94B8D8]"}`}
                    >
                      <td className="py-2 pr-2 font-mono text-xs">
                        {entry.position <= 3
                          ? ["🥇", "🥈", "🥉"][entry.position - 1]
                          : entry.position}
                      </td>
                      <td className="py-2 font-medium truncate max-w-[120px]">
                        {entry.nickname}
                      </td>
                      <td className="py-2 text-right font-mono font-bold">
                        {entry.totalPoints}
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        {entry.exactScores}
                      </td>
                      <td className="py-2 text-right font-mono text-xs hidden sm:table-cell">
                        {prize ? (
                          <span className="text-[#22C55E] font-bold">
                            {formatCurrency(prize)}
                          </span>
                        ) : (
                          <span className="text-[#5A7A9A]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-[white]",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-4 text-center">
      <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[#94B8D8] mt-1">{label}</p>
    </div>
  );
}
