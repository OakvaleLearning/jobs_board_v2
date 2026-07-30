"use client";

import CardActionArea from "@mui/material/CardActionArea";
import Link from "next/link";
import type { ReactNode } from "react";

/** CardActionArea that navigates via the Next.js router. Safe in Server Components. */
export default function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <CardActionArea component={Link} href={href}>
      {children}
    </CardActionArea>
  );
}
