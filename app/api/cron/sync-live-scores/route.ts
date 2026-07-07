import { NextResponse } from "next/server";
import { runSyncLiveScoresJob } from "@/lib/jobs/sync-live-scores";
import {
  internalErrorResponse,
  unauthorizedCronResponse,
  verifyCronSecret,
} from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return unauthorizedCronResponse();
  }

  try {
    const result = await runSyncLiveScoresJob();
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[cron/sync-live-scores]", e);
    return internalErrorResponse();
  }
}
