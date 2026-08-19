"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { alpha } from "@mui/material/styles";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import type { Variants } from "framer-motion";
import { MotionBox } from "@/components/motion";
import { docIcon } from "./icons";
import type { DocArticle, DocBlock } from "@/lib/docs/content";

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <Typography variant="h5" sx={{ mt: 2 }}>
          {block.text}
        </Typography>
      );
    case "paragraph":
      return (
        <Typography sx={{ color: "text.secondary", fontSize: "1.02rem", lineHeight: 1.75 }}>
          {block.text}
        </Typography>
      );
    case "list":
      return (
        <Stack spacing={1.25}>
          {block.items.map((li, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
              <CheckCircleRoundedIcon sx={{ color: "primary.main", fontSize: 20, mt: 0.3, flexShrink: 0 }} />
              <Typography sx={{ color: "text.secondary", lineHeight: 1.65 }}>{li}</Typography>
            </Box>
          ))}
        </Stack>
      );
    case "steps":
      return (
        <Stack spacing={0}>
          {block.items.map((step, i) => (
            <Box key={i} sx={{ display: "flex", gap: 2, position: "relative", pb: i === block.items.length - 1 ? 0 : 3 }}>
              {/* connector line */}
              {i !== block.items.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 17,
                    top: 36,
                    bottom: 0,
                    width: 2,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
                  }}
                />
              )}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  color: "primary.contrastText",
                  background: (t) => `linear-gradient(135deg, ${t.palette.primary.light}, ${t.palette.primary.main})`,
                  boxShadow: (t) => `0 6px 16px ${alpha(t.palette.primary.main, 0.3)}`,
                }}
              >
                {i + 1}
              </Box>
              <Box sx={{ pt: 0.25 }}>
                <Typography sx={{ fontWeight: 700, mb: 0.25 }}>{step.title}</Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>{step.body}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      );
    case "callout":
      return (
        <Alert severity={block.variant} sx={{ borderRadius: 3 }}>
          {block.title && <AlertTitle>{block.title}</AlertTitle>}
          {block.body}
        </Alert>
      );
    default:
      return null;
  }
}

export default function DocArticleView({ doc }: { doc: DocArticle }) {
  return (
    <Box sx={{ maxWidth: 780, mx: "auto" }}>
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        sx={{ mb: 4 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
              "& svg": { fontSize: 26 },
            }}
          >
            {docIcon(doc.icon)}
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip label={doc.category} size="small" color="primary" variant="outlined" />
            <Chip
              icon={<ScheduleRoundedIcon />}
              label={doc.readingTime}
              size="small"
              variant="outlined"
              sx={{ color: "text.secondary" }}
            />
          </Stack>
        </Stack>
        <Typography variant="h3" sx={{ mb: 1 }}>
          {doc.title}
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: "1.1rem" }}>{doc.description}</Typography>
      </MotionBox>

      {/* Body */}
      <MotionBox
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
      >
        <Stack spacing={3}>
          {doc.blocks.map((block, i) => (
            <MotionBox key={i} variants={item}>
              <Block block={block} />
            </MotionBox>
          ))}
        </Stack>
      </MotionBox>
    </Box>
  );
}
