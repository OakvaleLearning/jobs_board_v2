"use client";

import { useTransition } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import Link from "next/link";
import { toggleShortlist } from "@/app/employer/shortlist-actions";

export type WorkerCardData = {
  id: string;
  name: string;
  photoUrl: string | null;
  category: string | null;
  state: string | null;
  lga: string | null;
  experienceLevel: string | null;
  languages: string[];
  certified: boolean;
  backgroundClear: boolean;
  shortlisted: boolean;
};

export default function WorkerCard({ worker }: { worker: WorkerCardData }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Avatar src={worker.photoUrl ?? undefined} sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
            {worker.name.slice(0, 1)}
          </Avatar>
          <IconButton
            aria-label={worker.shortlisted ? "Remove from shortlist" : "Save to shortlist"}
            color="secondary"
            disabled={pending}
            onClick={() => startTransition(() => toggleShortlist(worker.id))}
          >
            {worker.shortlisted ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
          </IconButton>
        </Box>

        <Typography variant="h6" sx={{ mt: 1.5 }}>
          {worker.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {worker.category ?? "Care worker"}
          {worker.experienceLevel ? ` · ${worker.experienceLevel}` : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {[worker.lga, worker.state].filter(Boolean).join(", ") || "Location not set"}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ my: 1.5, flexWrap: "wrap", gap: 0.75 }}>
          {worker.certified && (
            <Chip icon={<VerifiedRoundedIcon />} label="Oakvale verified" color="primary" size="small" />
          )}
          {worker.backgroundClear && <Chip label="Background clear" color="success" size="small" />}
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75, mb: 2 }}>
          {worker.languages.slice(0, 3).map((l) => (
            <Chip key={l} label={l} size="small" variant="outlined" />
          ))}
        </Stack>

        <Box sx={{ mt: "auto" }}>
          <Button component={Link} href={`/employer/workers/${worker.id}`} variant="outlined" fullWidth>
            View profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
