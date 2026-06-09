"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PredictionType } from "@prisma/client";

// Predictions lock when the first group match starts: June 11, 2026 19:00 UTC
const PREDICTIONS_DEADLINE = new Date("2026-06-11T19:00:00Z");

export async function savePrediction(type: PredictionType, value: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Não autenticado" };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { error: "Valor não pode ser vazio" };
  }

  if (new Date() >= PREDICTIONS_DEADLINE) {
    return { error: "Prazo para palpites especiais encerrado" };
  }

  await prisma.prediction.upsert({
    where: {
      userId_type: { userId: session.user.id, type },
    },
    update: { value: trimmed },
    create: {
      userId: session.user.id,
      type,
      value: trimmed,
    },
  });

  return { success: true };
}
