"use client";

import { useState } from "react";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * MUI Rating wrapper. In display mode it renders read-only stars with an
 * optional "(count)" caption; in input mode it posts the value through a hidden
 * field named `name` so it works inside a plain <form action={...}>.
 */
export default function StarRating({
  value,
  count,
  readOnly = true,
  name,
  defaultValue = 0,
  size = "small",
  showCount = true,
}: {
  value?: number | null;
  count?: number;
  readOnly?: boolean;
  name?: string;
  defaultValue?: number;
  size?: "small" | "medium" | "large";
  showCount?: boolean;
}) {
  const [current, setCurrent] = useState<number>(defaultValue);

  if (readOnly) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Rating value={value ?? 0} precision={0.5} readOnly size={size} />
        {showCount && (
          <Typography variant="caption" color="text.secondary">
            {value && count ? `${value.toFixed(1)} (${count})` : "No reviews yet"}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Rating
        value={current}
        size={size}
        onChange={(_, v) => setCurrent(v ?? 0)}
      />
      <input type="hidden" name={name} value={current} />
    </Box>
  );
}
