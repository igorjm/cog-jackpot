"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { betSchema } from "@/lib/validations";
import { isBeforeDeadline } from "@/lib/deadline";
import { revalidatePath } from "next/cache";

export async function placeBet(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" };
  if (session.user.status !== "APPROVED") return { error: "Acesso não autorizado" };

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
  revalidatePath("/dashboard");
  return { success: true };
}
