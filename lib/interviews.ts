import crypto from "node:crypto";

/**
 * Virtual interview meeting links (US-3.1).
 *
 * The room name is derived deterministically from the application id plus a
 * server-side secret, so the same interview always resolves to the same room
 * and the id is never guessable from the application id alone.
 *
 * Defaults to a Jitsi Meet room, which needs no account or API key. Point
 * `INTERVIEW_MEETING_BASE_URL` at another provider to change it; swap this
 * function for an API call when a provider that issues scheduled meetings
 * (Zoom, Google Meet, Whereby) is wired up.
 */
const BASE = process.env.INTERVIEW_MEETING_BASE_URL || "https://meet.jit.si";

export function meetingUrlFor(applicationId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "oakvale-dev";
  const room = crypto
    .createHmac("sha256", secret)
    .update(`interview:${applicationId}`)
    .digest("hex")
    .slice(0, 20);
  return `${BASE.replace(/\/$/, "")}/oakvale-${room}`;
}
