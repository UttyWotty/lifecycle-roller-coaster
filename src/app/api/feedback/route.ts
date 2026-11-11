/**
 * HTTP adapter for visitor feedback.
 * It blocks automated requests, reads the body under a small size limit, and hands the rest to submitFeedback.
 * Logs record only an error code, so a message's words never reach them.
 */
import { NextResponse } from "next/server";
import { BUILD, feedbackStore, isAutomatedRequest, limitStore, visitorIdFor } from "@/app/api/publicAccess";
import { readBodyWithinLimit } from "@/app/api/readBody";
import { MAX_FEEDBACK_BODY_BYTES } from "@/lib/feedback/feedback";
import { feedbackError, submitFeedback, type FeedbackResponse } from "@/lib/feedback/submitFeedback";

const LOGGED_STATUS_FLOOR = 500;

async function respond(request: Request): Promise<FeedbackResponse> {
  if (await isAutomatedRequest()) {
    return feedbackError("forbidden");
  }
  const body = await readBodyWithinLimit(request, MAX_FEEDBACK_BODY_BYTES);
  if (body === null) {
    return feedbackError("payload_too_large");
  }
  return submitFeedback(request.headers.get("content-type"), body, {
    limitStore,
    feedbackStore,
    visitorId: visitorIdFor(request.headers),
    now: new Date(),
    build: BUILD,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const response = await respond(request);
  if (response.status >= LOGGED_STATUS_FLOOR && "error" in response.body) {
    console.error("Feedback failed with code %s", response.body.error);
  }
  return NextResponse.json(response.body, { status: response.status });
}
