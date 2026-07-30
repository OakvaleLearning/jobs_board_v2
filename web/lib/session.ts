import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Redirects to /login if there is no session. Returns the session user. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirects to /login if unauthenticated, or the role's home if the role mismatches. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect(roleHome(user.role));
  }
  return user;
}

/** Agent workspace guard — agents and admins may operate here. */
export async function requireAgent() {
  return requireRole("AGENT", "ADMIN");
}

export function roleHome(role: Role): string {
  switch (role) {
    case "WORKER":
      return "/worker";
    case "EMPLOYER":
      return "/employer";
    case "AGENT":
      return "/agent";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}

/** Loads the full DB user record for the current session (or null). */
export async function getCurrentDbUser() {
  const user = await getSessionUser();
  if (!user?.id) return null;
  return prisma.user.findFirst({ where: { id: user.id, deletedAt: null } });
}
