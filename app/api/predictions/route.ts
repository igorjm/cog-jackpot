import { NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireApprovedSession();
  if (!guard.ok) return guard.response;

  const { session } = guard;

  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(predictions);
}
