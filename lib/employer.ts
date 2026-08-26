import { prisma } from "@/lib/prisma";

export async function getEmployerProfileByUserId(userId: string) {
  return prisma.employerProfile.findUnique({
    where: { userId },
    include: { documents: { orderBy: { createdAt: "desc" } }, employerType: true },
  });
}

/**
 * An employer can post jobs / hire only once Oakvale has verified their account.
 * Returns a plain-language reason when blocked, or null when clear.
 */
export function employerBlockReason(profile: {
  verificationStatus: string;
  suspendedAt?: Date | null;
} | null): string | null {
  if (!profile) {
    return "Complete your company profile to get started.";
  }
  if (profile.suspendedAt) {
    return "Your account has been suspended. Please contact Oakvale support.";
  }
  if (profile.verificationStatus === "REJECTED") {
    return "Your account verification was declined. Please contact Oakvale support.";
  }
  if (profile.verificationStatus !== "APPROVED") {
    return "Your account is awaiting Oakvale verification. We review new employers within 2 working days.";
  }
  return null;
}
