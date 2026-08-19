import { requireUser, roleHome } from "@/lib/session";
import { docsForRole, roleDocLabel } from "@/lib/docs/access";
import DocsShell, { type DocNavItem } from "@/components/docs/DocsShell";

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items: DocNavItem[] = docsForRole(user.role).map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    icon: doc.icon,
    category: doc.category,
  }));

  return (
    <DocsShell items={items} roleLabel={roleDocLabel(user.role)} backHref={roleHome(user.role)}>
      {children}
    </DocsShell>
  );
}
