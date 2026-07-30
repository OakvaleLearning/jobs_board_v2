"use client";

import type { FC } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import Card, { type CardProps } from "@mui/material/Card";

type MotionCardProps = Omit<
  CardProps,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "style"
> &
  HTMLMotionProps<"div">;

const MotionCard = motion.create(Card) as FC<MotionCardProps>;

/** Card that lifts on hover — used for job, worker, and dashboard tiles. */
export default function AnimatedCard({ children, sx, ...props }: MotionCardProps) {
  return (
    <MotionCard
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(16,40,16,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      sx={{ height: "100%", ...sx }}
      {...props}
    >
      {children}
    </MotionCard>
  );
}
