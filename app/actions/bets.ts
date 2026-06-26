"use server";

import { requireApprovedUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { betSchema } from "@/lib/validations";
import { isBeforeDeadline } from "@/lib/deadline";
import { revalidatePath } from "next/cache";

export async function placeBet(formData: FormData) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { error: guard.error };

  const { session } = guard;

  const raw = {
    matchId: formData.get("matchId") as string,
    homeScore: Number(formData.get("homeScore")),
    awayScore: Number(formData.get("awayScore")),
  };

  const parsed = betSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const match = await prisma.match.findUnique({ where: { id: parsed.data.matchId } });
  if (!match) return { error: "Jogo não encontrado" };

  if (!isBeforeDeadline(match.matchDate)) {
    return { error: "Prazo para palpite encerrado" };
  }

  await prisma.bet.upsert({
    where: {
      userId_matchId: {
        userId: session.user.id,
        matchId: parsed.data.matchId,
      },
    },
    update: {
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
    },
    create: {
      userId: session.user.id,
      matchId: parsed.data.matchId,
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
    },
  });

  revalidatePath("/matches");
  revalidatePath("/my-bets");
  revalidatePath("/dashboard");
  return { success: true };
}
