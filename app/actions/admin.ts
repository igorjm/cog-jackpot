"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resultSchema, notificationSchema } from "@/lib/validations";
import { calculatePoints, calculateFinalPoints } from "@/lib/scoring";
import { calculateRanking } from "@/lib/ranking";
import { fetchFinishedMatches } from "@/lib/football-api";
import { syncFinishedMatchResults } from "@/lib/match-sync";
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

  // Snapshot current ranking positions before they change
  const currentRanking = await calculateRanking();
  await Promise.all(
    currentRanking.map((entry) =>
      prisma.user.update({
        where: { id: entry.userId },
        data: { previousPosition: entry.position },
      })
    )
  );

  // Update match result
  await prisma.match.update({
    where: { id: parsed.data.matchId },
    data: {
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
      matchStatus: "FINISHED",
      liveHomeScore: null,
      liveAwayScore: null,
      liveUpdatedAt: null,
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

export async function resetUserPassword(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Acesso negado" };
  }

  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return { error: "ID inválido" };

  const tempPassword = randomBytes(16).toString("base64url");
  const hashed = await hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: parsed.data },
    data: { password: hashed },
  });

  return { success: true, tempPassword };
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

    // Snapshot current ranking positions before scores change
    const currentRanking = await calculateRanking();
    await Promise.all(
      currentRanking.map((entry) =>
        prisma.user.update({
          where: { id: entry.userId },
          data: { previousPosition: entry.position },
        })
      )
    );

    let synced = 0;
    let skipped = 0;

    const syncResult = await syncFinishedMatchResults(results);
    synced = syncResult.synced;
    skipped = syncResult.skipped;

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

    return {
      success: true,
      synced,
      skipped,
      message: `${synced} resultado(s) sincronizado(s)${skipped > 0 ? `, ${skipped} ignorado(s)` : ""}`,
    };
  } catch (e) {
    console.error("[admin/syncScores]", e);
    return { error: "Falha na sincronização. Tente novamente." };
  }
}

export async function sendCustomNotification(title: string, body: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Acesso negado" };
  }

  const parsed = notificationSchema.safeParse({ title, body });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const count = await prisma.pushSubscription.count();
  if (count === 0) {
    return { error: "Nenhum dispositivo com notificação ativa" };
  }

  await sendPushToAll({
    title: parsed.data.title,
    body: parsed.data.body,
    icon: "/icons/icon-192.png",
    url: "/dashboard",
  });

  return { success: true, message: `Enviado para ${count} dispositivo(s)` };
}
