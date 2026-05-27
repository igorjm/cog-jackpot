"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resultSchema } from "@/lib/validations";
import { calculatePoints, calculateFinalPoints } from "@/lib/scoring";
import { revalidatePath } from "next/cache";

const userIdSchema = z.string().cuid("ID de usuário inválido");

export async function saveResult(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Acesso negado" };
  }

  const raw = {
    matchId: formData.get("matchId") as string,
    homeScore: Number(formData.get("homeScore")),
    awayScore: Number(formData.get("awayScore")),
  };

  const parsed = resultSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    include: { bets: true },
  });

  if (!match) return { error: "Jogo não encontrado" };

  // Update match result
  await prisma.match.update({
    where: { id: parsed.data.matchId },
    data: {
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
      isLocked: true,
    },
  });

  // Calculate points for all bets on this match
  for (const bet of match.bets) {
    const result = calculatePoints(
      { homeScore: bet.homeScore, awayScore: bet.awayScore },
      { homeScore: parsed.data.homeScore, awayScore: parsed.data.awayScore }
    );

    const finalPoints = calculateFinalPoints(result.points, match.multiplier);

    await prisma.bet.update({
      where: { id: bet.id },
      data: {
        rawPoints: result.points,
        points: finalPoints,
      },
    });
  }

  revalidatePath("/admin/results");
  revalidatePath("/ranking");
  revalidatePath("/matches");
  return { success: true };
}

export async function approveUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Acesso negado" };
  }

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return { error: "ID inválido" };

  await prisma.user.update({
    where: { id: parsed.data },
    data: { status: "APPROVED" },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function rejectUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Acesso negado" };
  }

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return { error: "ID inválido" };

  await prisma.user.update({
    where: { id: parsed.data },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin/users");
  return { success: true };
}
