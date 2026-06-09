import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(predictions);
}
