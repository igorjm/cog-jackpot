import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Only reveal predictions after this deadline
const PREDICTIONS_DEADLINE = new Date("2026-06-11T19:00:00Z");

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (new Date() < PREDICTIONS_DEADLINE) {
    return NextResponse.json({ error: "Palpites visíveis apenas após o prazo" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { status: "APPROVED", role: { not: "ADMIN" } },
    select: {
      id: true,
      nickname: true,
      name: true,
      avatar: true,
      predictions: {
        select: { type: true, value: true },
      },
    },
    orderBy: { nickname: "asc" },
  });

  const result = users.map((u) => ({
    userId: u.id,
    nickname: u.nickname,
    name: u.name,
    avatar: u.avatar,
    champion: u.predictions.find((p) => p.type === "CHAMPION")?.value ?? null,
    topScorer: u.predictions.find((p) => p.type === "TOP_SCORER")?.value ?? null,
  }));

  return NextResponse.json(result);
}
