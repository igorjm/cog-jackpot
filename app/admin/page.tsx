import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboard() {
  const totalUsers = await prisma.user.count();
  const approvedUsers = await prisma.user.count({ where: { status: "APPROVED" } });
  const pendingUsers = await prisma.user.count({ where: { status: "PENDING_PAYMENT" } });
  const entryFee = parseFloat(process.env.NEXT_PUBLIC_ENTRY_FEE ?? "50");
  const totalAmount = approvedUsers * entryFee;

  const matchesWithoutResult = await prisma.match.count({
    where: { homeScore: null, matchDate: { lt: new Date() } },
  });

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
        <div className="bg-[#122448] rounded-xl border border-[#FFD60A]/30 p-4">
          <p className="text-sm">
            ⚠️ <span className="font-medium">{matchesWithoutResult} jogo(s)</span> já
            aconteceram mas ainda não têm resultado inserido.
          </p>
        </div>
      )}
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
    <div className="bg-[#122448] rounded-xl border border-[#1E3A6E] p-4 text-center">
      <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[#94B8D8] mt-1">{label}</p>
    </div>
  );
}
