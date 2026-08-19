"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import Logo from "@/components/Logo";
import { docIcon } from "./icons";

export type DocNavItem = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
};

const DRAWER_WIDTH = 300;

export default function DocsShell({
  items,
  roleLabel,
  backHref,
  children,
}: {
  items: DocNavItem[];
  roleLabel: string;
  backHref: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, DocNavItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Link href="/">
          <Logo size={22} />
        </Link>
        <Box
          component={Link}
          href={backHref}
          sx={{
            mt: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            color: "text.secondary",
            textDecoration: "none",
            fontSize: "0.82rem",
            fontWeight: 600,
            transition: "color .2s, transform .2s",
            "&:hover": { color: "primary.main", transform: "translateX(-2px)" },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
          Back to dashboard
        </Box>
      </Box>

      <Box sx={{ px: 2.5, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <MenuBookRoundedIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
            Documentation
          </Typography>
        </Box>
        <Chip label={roleLabel} size="small" color="primary" variant="outlined" />
      </Box>

      {/* Search */}
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 3,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
            border: "1px solid",
            borderColor: "divider",
            transition: "border-color .2s, box-shadow .2s",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.12)}`,
            },
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <InputBase
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides…"
            sx={{ fontSize: "0.9rem", flex: 1 }}
            inputProps={{ "aria-label": "Search documentation" }}
          />
        </Box>
      </Box>

      <Divider sx={{ mx: 2.5 }} />

      {/* Nav */}
      <Box
        component={motion.nav}
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.03 } } }}
        sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, py: 2 }}
      >
        {grouped.length === 0 && (
          <Typography color="text.secondary" sx={{ px: 1.5, py: 2, fontSize: "0.85rem" }}>
            No guides match “{query}”.
          </Typography>
        )}
        {grouped.map(([category, entries]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography
              sx={{
                px: 1.5,
                mb: 0.75,
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {category}
            </Typography>
            {entries.map((item) => {
              const href = `/docs/${item.slug}`;
              const active = pathname === href;
              return (
                <Box
                  key={item.slug}
                  component={motion.div}
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  sx={{ position: "relative" }}
                >
                  {active && (
                    <Box
                      component={motion.div}
                      layoutId="docs-active"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 2.5,
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                        border: "1px solid",
                        borderColor: (t) => alpha(t.palette.primary.main, 0.22),
                      }}
                    />
                  )}
                  <Box
                    component={Link}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      px: 1.5,
                      py: 1,
                      mb: 0.25,
                      borderRadius: 2.5,
                      textDecoration: "none",
                      color: active ? "primary.main" : "text.secondary",
                      fontWeight: active ? 700 : 500,
                      transition: "color .2s",
                      "&:hover": { color: "primary.main" },
                      "& svg": { fontSize: 20 },
                    }}
                  >
                    {docIcon(item.icon)}
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: "inherit", lineHeight: 1.2 }}>
                      {item.title}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppBar
          position="sticky"
          sx={{ display: { md: "none" }, bgcolor: "background.paper", color: "text.primary" }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open documentation menu">
              <MenuRoundedIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MenuBookRoundedIcon sx={{ color: "primary.main" }} />
              <Typography sx={{ fontWeight: 800 }}>Docs</Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 5 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
