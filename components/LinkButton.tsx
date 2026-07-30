"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import Link from "next/link";

type LinkButtonProps = ButtonProps & { href: string };

/**
 * MUI Button that navigates with the Next.js client router. Safe to use from
 * Server Components (unlike passing `component={Link}` across the boundary).
 */
export default function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button component={Link} href={href} {...props} />;
}
