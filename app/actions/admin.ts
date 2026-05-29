"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resultSchema } from "@/lib/validations";
import { calculatePoints, calculateFinalPoints } from "@/lib/scoring";
import { fetchFinishedMatches } from "@/lib/football-api";
import { revalidatePath } from "next/cache";
import { sendPushToAll, sendPushToUser } from "@/lib/push";

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

  // If this is a FRIENDLY match, check if ALL friendly matches now have results.
  // If yes, zero out all friendly bet points (they don't count long-term).
  if (match.phase === "FRIENDLY") {
    const pendingFriendlies = await prisma.match.count({
      where: { phase: "FRIENDLY", homeScore: null },
    });
    if (pendingFriendlies === 0) {
      // All friendlies have results — zero out points
      await prisma.bet.updateMany({
        where: { match: { phase: "FRIENDLY" } },
        data: { points: 0, rawPoints: 0 },
      });
    }
  }

  revalidatePath("/admin/results");
  revalidatePath("/ranking");
  revalidatePath("/matches");

  // Send push notification to all users
  sendPushToAll({
    title: "⚽ Resultado registrado!",
    body: `${match.homeTeam} ${parsed.data.homeScore} x ${parsed.data.awayScore} ${match.awayTeam}`,
    icon: "/icons/icon-192.png",
    url: "/matches",
  }).catch(() => {});

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

  // Notify the approved user
  sendPushToUser(parsed.data, {
    title: "✅ Cadastro aprovado!",
    body: "Seu pagamento foi confirmado. Bora fazer seus palpites!",
    icon: "/icons/icon-192.png",
    url: "/dashboard",
  }).catch(() => {});

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

export async function syncScores() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Acesso negado" };
  }

  try {
    const results = await fetchFinishedMatches();
    if (results.length === 0) {
      return { success: true, synced: 0, message: "Nenhum resultado novo encontrado" };
    }

    let synced = 0;

    for (const result of results) {
      // Find matching match by date proximity (within 2 hours)
      const matchDate = new Date(result.matchDate);
      const dateFrom = new Date(matchDate.getTime() - 2 * 60 * 60 * 1000);
      const dateTo = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);

      const match = await prisma.match.findFirst({
        where: {
          matchDate: { gte: dateFrom, lte: dateTo },
          homeScore: null,
          phase: result.phase,
        },
        include: { bets: true },
      });

      if (!match) continue;

      // Update match result
      await prisma.match.update({
        where: { id: match.id },
        data: {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          isLocked: true,
        },
      });

      // Calculate points for all bets
      for (const bet of match.bets) {
        const pointsResult = calculatePoints(
          { homeScore: bet.homeScore, awayScore: bet.awayScore },
          { homeScore: result.homeScore, awayScore: result.awayScore }
        );
        const finalPoints = calculateFinalPoints(pointsResult.points, match.multiplier);

        await prisma.bet.update({
          where: { id: bet.id },
          data: { rawPoints: pointsResult.points, points: finalPoints },
        });
      }

      synced++;
    }

    revalidatePath("/admin/results");
    revalidatePath("/ranking");
    revalidatePath("/matches");

    if (synced > 0) {
      sendPushToAll({
        title: "⚽ Resultados atualizados!",
        body: `${synced} resultado(s) sincronizado(s). Confira sua pontuação!`,
        icon: "/icons/icon-192.png",
        url: "/ranking",
      }).catch(() => {});
    }

    return { success: true, synced, message: `${synced} resultado(s) sincronizado(s)` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return { error: `Falha na sincronização: ${msg}` };
  }
}
