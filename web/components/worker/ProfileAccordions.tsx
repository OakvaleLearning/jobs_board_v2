"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import type { ReactNode } from "react";

export type Section = {
  id: string;
  title: string;
  subtitle: string;
  complete: boolean;
  content: ReactNode;
};

export default function ProfileAccordions({ sections }: { sections: Section[] }) {
  const firstIncomplete = sections.find((s) => !s.complete)?.id ?? sections[0]?.id;
  const [expanded, setExpanded] = useState<string | false>(firstIncomplete ?? false);

  return (
    <Box>
      {sections.map((s) => (
        <Accordion
          key={s.id}
          expanded={expanded === s.id}
          onChange={(_, isOpen) => setExpanded(isOpen ? s.id : false)}
          disableGutters
          sx={{
            mb: 1.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            "&:before": { display: "none" },
            overflow: "hidden",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 3, py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {s.complete ? (
                <CheckCircleRoundedIcon color="success" />
              ) : (
                <RadioButtonUncheckedRoundedIcon color="disabled" />
              )}
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{s.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.subtitle}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>{s.content}</AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
