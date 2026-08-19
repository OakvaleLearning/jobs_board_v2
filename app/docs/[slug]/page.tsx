import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getDoc } from "@/lib/docs/content";
import { canAccessDoc } from "@/lib/docs/access";
import DocArticleView from "@/components/docs/DocArticleView";

export default async function DocArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const doc = getDoc(slug);

  // Not found doubles as the access guard: workers can't reach employer/admin
  // docs and vice-versa, so a disallowed slug simply looks like it doesn't exist.
  if (!doc || !canAccessDoc(user.role, doc)) notFound();

  return <DocArticleView doc={doc} />;
}
