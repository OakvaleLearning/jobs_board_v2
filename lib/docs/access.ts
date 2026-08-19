import type { Role } from "@/generated/prisma/client";
import { docs, type DocArticle, type DocAudience } from "./content";

/**
 * Which documentation audiences a role may read.
 * - Workers see only worker docs, employers only employer docs.
 * - Oakvale staff (Admin & Agent) see everything.
 */
export function audiencesForRole(role: Role): DocAudience[] {
  switch (role) {
    case "WORKER":
      return ["worker"];
    case "EMPLOYER":
      return ["employer"];
    case "ADMIN":
    case "AGENT":
      return ["worker", "employer", "admin"];
    default:
      return [];
  }
}

/** Articles this role is allowed to see, in authored order. */
export function docsForRole(role: Role): DocArticle[] {
  const allowed = audiencesForRole(role);
  return docs.filter((doc) => doc.audiences.some((a) => allowed.includes(a)));
}

/** Whether a role can read a specific article. */
export function canAccessDoc(role: Role, doc: DocArticle): boolean {
  const allowed = audiencesForRole(role);
  return doc.audiences.some((a) => allowed.includes(a));
}

/** A short human label for the reader's role. */
export function roleDocLabel(role: Role): string {
  switch (role) {
    case "WORKER":
      return "Care Worker guides";
    case "EMPLOYER":
      return "Employer guides";
    case "ADMIN":
      return "All documentation";
    case "AGENT":
      return "Staff documentation";
    default:
      return "Documentation";
  }
}
