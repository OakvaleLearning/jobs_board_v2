"use client";

import { useTransition } from "react";
import Button from "@mui/material/Button";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import { toggleShortlist } from "@/app/employer/shortlist-actions";

export default function ShortlistButton({
  workerId,
  shortlisted,
}: {
  workerId: string;
  shortlisted: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant={shortlisted ? "contained" : "outlined"}
      color="secondary"
      disabled={pending}
      startIcon={shortlisted ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
      onClick={() => startTransition(() => toggleShortlist(workerId))}
      sx={shortlisted ? { color: "#3A2E00" } : undefined}
    >
      {shortlisted ? "Shortlisted" : "Save to shortlist"}
    </Button>
  );
}
