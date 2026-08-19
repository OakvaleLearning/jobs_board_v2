"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import type { Variants } from "framer-motion";
import { MotionBox } from "@/components/motion";
import { docIcon } from "./icons";
import type { DocNavItem } from "./DocsShell";

const card: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function DocsIndex({
  items,
  roleLabel,
  welcomeName,
}: {
  items: DocNavItem[];
  roleLabel: string;
  welcomeName: string;
}) {
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      {/* Hero */}
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          mb: 5,
          color: "primary.contrastText",
          background: (t) => `linear-gradient(135deg, ${t.palette.primary.light}, ${t.palette.primary.dark})`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: -40,
            opacity: 0.12,
            "& svg": { fontSize: 240 },
          }}
        >
          <MenuBookRoundedIcon />
        </Box>
        <Chip
          label={roleLabel}
          size="small"
          sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.18)", color: "inherit", fontWeight: 700 }}
        />
        <Typography variant="h3" sx={{ mb: 1, position: "relative" }}>
          Help & documentation
        </Typography>
        <Typography sx={{ opacity: 0.9, fontSize: "1.1rem", maxWidth: 560, position: "relative" }}>
          {welcomeName ? `Welcome, ${welcomeName}. ` : ""}
          Step-by-step guides that walk you through every part of the Oakvale Jobs Portal.
        </Typography>
      </MotionBox>

      {/* Categories */}
      {categories.map((category) => (
        <Box key={category} sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {category}
          </Typography>
          <MotionBox
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            <Grid container spacing={2.5}>
              {items
                .filter((i) => i.category === category)
                .map((doc) => (
                  <Grid key={doc.slug} size={{ xs: 12, sm: 6 }}>
                    <MotionBox
                      variants={card}
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      sx={{ height: "100%" }}
                    >
                    <Box
                      component={Link}
                      href={`/docs/${doc.slug}`}
                      sx={{
                        display: "block",
                        height: "100%",
                        p: 3,
                        borderRadius: 4,
                        textDecoration: "none",
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "border-color .2s, box-shadow .2s",
                        "&:hover": {
                          borderColor: (t) => alpha(t.palette.primary.main, 0.4),
                          boxShadow: "0 16px 40px rgba(16,40,16,0.1)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 3,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            color: "primary.main",
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                            "& svg": { fontSize: 24 },
                          }}
                        >
                          {docIcon(doc.icon)}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                            {doc.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.55 }}>
                            {doc.description}
                          </Typography>
                        </Box>
                        <ArrowForwardRoundedIcon sx={{ color: "primary.main", fontSize: 20, ml: "auto", flexShrink: 0 }} />
                      </Stack>
                    </Box>
                    </MotionBox>
                  </Grid>
                ))}
            </Grid>
          </MotionBox>
        </Box>
      ))}
    </Box>
  );
}
