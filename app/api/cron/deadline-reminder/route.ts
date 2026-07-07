import { NextResponse } from "next/server";
import { runDeadlineReminderJob } from "@/lib/jobs/deadline-reminder";
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
    const result = await runDeadlineReminderJob();
    return NextResponse.json(result);
  } catch (e) {
    console.error("[cron/deadline-reminder]", e);
    return internalErrorResponse();
  }
}
