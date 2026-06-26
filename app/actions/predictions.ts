"use server";

import { requireApprovedUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { predictionValueSchema } from "@/lib/validations";
import { PredictionType } from "@prisma/client";

const PREDICTIONS_DEADLINE = new Date("2026-06-11T19:00:00Z");

export async function savePrediction(type: PredictionType, value: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { error: guard.error };

  const parsed = predictionValueSchema.safeParse(value);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (new Date() >= PREDICTIONS_DEADLINE) {
    return { error: "Prazo para palpites especiais encerrado" };
  }

  await prisma.prediction.upsert({
    where: {
      userId_type: { userId: guard.session.user.id, type },
    },
    update: { value: parsed.data },
    create: {
      userId: guard.session.user.id,
      type,
      value: parsed.data,
    },
  });

  return { success: true };
}
