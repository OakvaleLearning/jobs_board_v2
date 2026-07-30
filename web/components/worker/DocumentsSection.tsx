"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DocumentRow from "@/components/worker/DocumentRow";
import { documentTypeLabels } from "@/lib/constants";
import type { DocumentType, VerificationStatus } from "@/generated/prisma/client";

type Doc = { type: DocumentType; fileUrl: string; fileName: string; status: VerificationStatus };

const GROUPS: { heading: string; caption: string; types: DocumentType[] }[] = [
  {
    heading: "Identity (upload one)",
    caption: "A government-issued ID is required to verify who you are.",
    types: ["NIN", "PASSPORT", "VOTER_CARD", "DRIVERS_LICENCE"],
  },
  {
    heading: "Selfie & address",
    caption: "A recent photo of yourself and proof of your address.",
    types: ["SELFIE", "ADDRESS_PROOF"],
  },
  {
    heading: "Conduct & references",
    caption: "Background documents that support your good conduct.",
    types: ["POLICE_REPORT", "GUARANTOR_LETTER", "AFFIDAVIT"],
  },
  {
    heading: "Optional",
    caption: "A short video introduction can help you stand out.",
    types: ["VIDEO_INTRO"],
  },
];

export default function DocumentsSection({ documents }: { documents: Doc[] }) {
  const byType = new Map(documents.map((d) => [d.type, d]));

  return (
    <Stack spacing={3}>
      {GROUPS.map((g) => (
        <Box key={g.heading}>
          <Typography variant="subtitle1">{g.heading}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {g.caption}
          </Typography>
          <Stack spacing={1.5}>
            {g.types.map((t) => {
              const doc = byType.get(t);
              return (
                <DocumentRow
                  key={t}
                  type={t}
                  label={documentTypeLabels[t]}
                  existing={doc ? { fileUrl: doc.fileUrl, fileName: doc.fileName, status: doc.status } : null}
                />
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
