import { requireApprovedSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireApprovedSession();
  if (!guard.ok) return guard.response;

  const { session } = guard;
  const body = await req.json();
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  if (!isValidHttpsUrl(endpoint)) {
    return NextResponse.json({ error: "Invalid endpoint URL" }, { status: 400 });
  }

  if (typeof keys.p256dh !== "string" || keys.p256dh.length > 200) {
    return NextResponse.json({ error: "Invalid p256dh key" }, { status: 400 });
  }

  if (typeof keys.auth !== "string" || keys.auth.length > 100) {
    return NextResponse.json({ error: "Invalid auth key" }, { status: 400 });
  }

  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint },
    select: { userId: true },
  });

  if (existing && existing.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Endpoint already registered to another account" },
      { status: 409 }
    );
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      userId: session.user.id,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireApprovedSession();
  if (!guard.ok) return guard.response;

  const { session } = guard;
  const body = await req.json();
  const { endpoint } = body;

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
