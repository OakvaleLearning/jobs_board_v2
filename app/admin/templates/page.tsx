import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import TemplateEditor from "@/components/admin/TemplateEditor";
import { PageTransition } from "@/components/motion";
import { contractTypeLabels } from "@/lib/constants";
import type { ContractType } from "@/generated/prisma/client";

const TYPES: ContractType[] = ["WORKER_PLACEMENT", "EMPLOYER_SERVICE", "ANNUAL_PARTNERSHIP"];

export default async function AdminTemplatesPage() {
  await requireRole("ADMIN");
  const templates = await prisma.contractTemplate.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { version: "desc" },
  });
  const byType = new Map(templates.map((t) => [t.type, t]));

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Contract templates
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Variable-populated templates used to generate placement contracts. Edit and version them here —
        the legal team can replace the default wording without a code change.
      </Typography>

      <Stack spacing={3}>
        {TYPES.map((type) => {
          const t = byType.get(type);
          return (
            <TemplateEditor
              key={type}
              type={type}
              name={t?.name ?? `${contractTypeLabels[type]} (default)`}
              body={t?.body ?? ""}
              version={t?.version ?? null}
            />
          );
        })}
      </Stack>
    </PageTransition>
  );
}
