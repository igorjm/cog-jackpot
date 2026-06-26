import { NextResponse } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";

type DbUser = {
  id: string;
  status: string;
  role: string;
};

async function loadUser(userId: string): Promise<DbUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true, role: true },
  });
}

export async function requireApprovedSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await loadUser(session.user.id);
  if (!user || user.status !== "APPROVED") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const, session, user };
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await loadUser(session.user.id);
  if (!user || user.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const, session, user };
}

/** For server actions — verifies APPROVED status from DB. */
export async function requireApprovedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Não autenticado" };
  }

  const user = await loadUser(session.user.id);
  if (!user || user.status !== "APPROVED") {
    return { ok: false as const, error: "Acesso não autorizado" };
  }

  return { ok: true as const, session, user };
}
