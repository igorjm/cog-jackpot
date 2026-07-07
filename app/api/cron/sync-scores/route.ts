import { NextResponse } from "next/server";
import { runSyncScoresJob } from "@/lib/jobs/sync-scores";
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
    const result = await runSyncScoresJob();
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[cron/sync-scores]", e);
    return internalErrorResponse();
  }
}
