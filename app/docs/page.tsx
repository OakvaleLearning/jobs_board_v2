import { requireUser } from "@/lib/session";
import { docsForRole, roleDocLabel } from "@/lib/docs/access";
import DocsIndex from "@/components/docs/DocsIndex";
import type { DocNavItem } from "@/components/docs/DocsShell";

export default async function DocsHome() {
  const user = await requireUser();
  const items: DocNavItem[] = docsForRole(user.role).map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    icon: doc.icon,
    category: doc.category,
  }));

  return (
    <DocsIndex
      items={items}
      roleLabel={roleDocLabel(user.role)}
      welcomeName={user.name?.split(" ")[0] ?? ""}
    />
  );
}
