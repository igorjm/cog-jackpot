import { prisma } from "@/lib/prisma";

const LIVE_WINDOW_MS = 150 * 60 * 1000;
const UPCOMING_BUFFER_MS = 30 * 60 * 1000;

/** True when a WC match could be live now or starting within 30 minutes. */
export async function hasMatchesInLiveWindow(): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - LIVE_WINDOW_MS);
  const windowEnd = new Date(now.getTime() + UPCOMING_BUFFER_MS);

  const [inWindow, inPlay] = await Promise.all([
    prisma.match.count({
      where: {
        homeScore: null,
        phase: { not: "FRIENDLY" },
        matchDate: { gte: windowStart, lte: windowEnd },
      },
    }),
    prisma.match.count({
      where: {
        homeScore: null,
        matchStatus: { in: ["IN_PLAY", "PAUSED"] },
      },
    }),
  ]);

  return inWindow > 0 || inPlay > 0;
}
