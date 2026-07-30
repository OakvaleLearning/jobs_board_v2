"use client";

import type { FC } from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import Box, { type BoxProps } from "@mui/material/Box";

// MUI's React drag/animation handler types conflict with Framer Motion's, so we
// drop them from BoxProps and let the motion equivalents take over.
export type MotionBoxProps = Omit<
  BoxProps,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "style"
> &
  HTMLMotionProps<"div">;

export const MotionBox = motion.create(Box) as FC<MotionBoxProps>;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Wrap a page's content to fade + slide it in on mount. */
export function PageTransition({ children, ...props }: MotionBoxProps) {
  return (
    <MotionBox initial="hidden" animate="show" variants={fadeUp} {...props}>
      {children}
    </MotionBox>
  );
}

/** A container whose direct <MotionItem> children animate in sequence. */
export function StaggerContainer({ children, ...props }: MotionBoxProps) {
  return (
    <MotionBox
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger}
      {...props}
    >
      {children}
    </MotionBox>
  );
}

export function MotionItem({ children, ...props }: MotionBoxProps) {
  return (
    <MotionBox variants={fadeUp} {...props}>
      {children}
    </MotionBox>
  );
}
