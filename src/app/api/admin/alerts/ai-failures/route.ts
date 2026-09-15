import { NextResponse } from "next/server";
import { clearAiFailures } from "@/lib/ai/failures";
import { errorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

/** The admin dismisses the "AI failed" notification. */
export async function DELETE() {
  try {
    await requireAdmin();
    return NextResponse.json({ cleared: await clearAiFailures() });
  } catch (error) {
    return errorResponse(error);
  }
}
