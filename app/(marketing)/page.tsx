"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "next/link";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { MotionBox, fadeUp, stagger, StaggerContainer, MotionItem } from "@/components/motion";

const heroSlides = [
  {
    image: "/hero-image2.png",
    lead: "Trusted childcare,",
    accent: "verified end to end.",
    body:
      "Oakvale connects certified Nigerian nannies and childcare workers with families and diaspora employers — every profile credentialed, screened, and managed by our team.",
  },
  {
    image: "/landing-hero.png",
    lead: "Compassionate elderly care,",
    accent: "credentialed and managed.",
    body:
      "Find screened caregivers for elderly and home-care support — Oakvale verifies identity, conduct, and certification, and coordinates the full placement.",
  },
];

const features = [
  {
    icon: <VerifiedRoundedIcon />,
    title: "Verified & credentialed",
    body: "Every worker holds an Oakvale certificate, admin-reviewed against our register before they appear as verified.",
  },
  {
    icon: <ShieldRoundedIcon />,
    title: "Background-checked",
    body: "ID, address, and conduct documents are collected and screened, so you hire with confidence.",
  },
  {
    icon: <HandshakeRoundedIcon />,
    title: "Managed placements",
    body: "Oakvale coordinates interviews, offers, and onboarding — with contact details protected until you hire.",
  },
];

const steps = [
  { n: "01", title: "Register & get verified", body: "Workers build a profile and upload their certificate; employers verify their identity or company." },
  { n: "02", title: "Match & shortlist", body: "Post a role or search the verified talent pool, then shortlist and request interviews." },
  { n: "03", title: "Offer & hire", body: "Make an offer through Oakvale, and we handle onboarding into an active placement." },
];

export default function LandingPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const slide = heroSlides[index];

  return (
    <>
      {/* Full-bleed hero */}
      <Box
        sx={{
          position: "relative",
          color: "#fff",
          overflow: "hidden",
          background:
            "radial-gradient(1200px 500px at 80% -10%, rgba(201,162,39,0.35), transparent 60%), linear-gradient(160deg, #1B5E20 0%, #144a19 55%, #0F3D14 100%)",
        }}
      >
        {/* Cross-fading background image slider */}
        <AnimatePresence>
          <MotionBox
            key={slide.image}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </AnimatePresence>

        {/* Dark overlay keeps text legible over the imagery */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, rgba(15,61,20,0.86) 0%, rgba(20,74,25,0.72) 55%, rgba(15,61,20,0.78) 100%)",
          }}
        />

        {/* Decorative animated blobs */}
        <MotionBox
          aria-hidden
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            width: 360,
            height: 360,
            top: -80,
            right: -60,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,39,0.4), transparent 70%)",
            filter: "blur(10px)",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 8, md: 12 } }}>
          <MotionBox initial="hidden" animate="show" variants={stagger}>
            <MotionItem>
              <Chip
                label="Nigeria's first credentialed care-work marketplace"
                sx={{
                  bgcolor: "rgba(255,255,255,0.14)",
                  color: "#fff",
                  fontWeight: 600,
                  mb: 3,
                  backdropFilter: "blur(6px)",
                }}
              />
            </MotionItem>
            <MotionItem>
              <AnimatePresence mode="wait">
                <MotionBox
                  key={`headline-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Typography
                    variant="h1"
                    sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, maxWidth: 900, lineHeight: 1.05 }}
                  >
                    {slide.lead}{" "}
                    <Box component="span" sx={{ color: "#E0C158" }}>
                      {slide.accent}
                    </Box>
                  </Typography>
                  <Typography
                    sx={{
                      mt: 3,
                      fontSize: { xs: "1.05rem", md: "1.25rem" },
                      maxWidth: 640,
                      opacity: 0.92,
                    }}
                  >
                    {slide.body}
                  </Typography>
                </MotionBox>
              </AnimatePresence>
            </MotionItem>
            <MotionItem>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 5 }}>
                <Button
                  component={Link}
                  href="/signup?role=worker"
                  size="large"
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ color: "#3A2E00" }}
                >
                  Find Care Work
                </Button>
                <Button
                  component={Link}
                  href="/signup?role=employer"
                  size="large"
                  variant="outlined"
                  sx={{
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.6)",
                    "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  Hire Trusted Staff
                </Button>
              </Stack>
            </MotionItem>
            <MotionItem>
              <Stack direction="row" spacing={4} sx={{ mt: 6, flexWrap: "wrap", gap: 2 }}>
                {[
                  ["100%", "Oakvale-certified"],
                  ["ID + conduct", "screened"],
                  ["Managed", "placements"],
                ].map(([big, small]) => (
                  <Box key={small}>
                    <Typography variant="h4" sx={{ color: "#E0C158" }}>
                      {big}
                    </Typography>
                    <Typography sx={{ opacity: 0.85 }}>{small}</Typography>
                  </Box>
                ))}
              </Stack>
            </MotionItem>
            <MotionItem>
              <Stack direction="row" spacing={1.5} sx={{ mt: 5 }}>
                {heroSlides.map((s, i) => (
                  <Box
                    key={s.image}
                    role="button"
                    aria-label={`Show slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    sx={{
                      width: i === index ? 28 : 12,
                      height: 12,
                      borderRadius: 6,
                      cursor: "pointer",
                      bgcolor: i === index ? "#E0C158" : "rgba(255,255,255,0.4)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Stack>
            </MotionItem>
          </MotionBox>
        </Container>
      </Box>

      {/* Value props */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <StaggerContainer>
          <MotionItem sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h3" gutterBottom>
              Hire with certainty
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 620, mx: "auto" }}>
              Trust is built on Oakvale certification. This isn&apos;t a general job board — it&apos;s a
              gated marketplace of screened, credentialed care professionals.
            </Typography>
          </MotionItem>
          <Grid container spacing={3}>
            {features.map((f) => (
              <Grid key={f.title} size={{ xs: 12, md: 4 }}>
                <MotionItem sx={{ height: "100%" }}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 3.5 }}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 3,
                          display: "grid",
                          placeItems: "center",
                          color: "primary.main",
                          bgcolor: "rgba(27,94,32,0.08)",
                          mb: 2,
                          "& svg": { fontSize: 28 },
                        }}
                      >
                        {f.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {f.title}
                      </Typography>
                      <Typography color="text.secondary">{f.body}</Typography>
                    </CardContent>
                  </Card>
                </MotionItem>
              </Grid>
            ))}
          </Grid>
        </StaggerContainer>
      </Container>

      {/* How it works */}
      <Box sx={{ bgcolor: "rgba(27,94,32,0.04)", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom sx={{ textAlign: "center" }}>
            How it works
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 6, textAlign: "center" }}>
            From registration to an active, supported placement.
          </Typography>
          <StaggerContainer>
            <Grid container spacing={3}>
              {steps.map((s) => (
                <Grid key={s.n} size={{ xs: 12, md: 4 }}>
                  <MotionItem>
                    <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
                      <CardContent sx={{ p: 3.5 }}>
                        <Typography
                          sx={{
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            color: "rgba(27,94,32,0.14)",
                            lineHeight: 1,
                          }}
                        >
                          {s.n}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }} gutterBottom>
                          {s.title}
                        </Typography>
                        <Typography color="text.secondary">{s.body}</Typography>
                      </CardContent>
                    </Card>
                  </MotionItem>
                </Grid>
              ))}
            </Grid>
          </StaggerContainer>
        </Container>
      </Box>

      {/* Dual CTA */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <MotionBox variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <Card sx={{ height: "100%", background: "linear-gradient(135deg,#F4F9F2,#fff)" }}>
                <CardContent sx={{ p: 4 }}>
                  <BadgeRoundedIcon color="primary" sx={{ fontSize: 36 }} />
                  <Typography variant="h5" sx={{ mt: 1.5 }} gutterBottom>
                    I&apos;m a care worker
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Build a verified profile, showcase your Oakvale certification, and get matched to
                    families and organisations who need you.
                  </Typography>
                  <Button
                    component={Link}
                    href="/signup?role=worker"
                    variant="contained"
                    endIcon={<WorkspacePremiumRoundedIcon />}
                  >
                    Find Care Work
                  </Button>
                </CardContent>
              </Card>
            </MotionBox>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MotionBox variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <Card sx={{ height: "100%", background: "linear-gradient(135deg,#FBF6E7,#fff)" }}>
                <CardContent sx={{ p: 4 }}>
                  <SearchRoundedIcon sx={{ fontSize: 36, color: "secondary.dark" }} />
                  <Typography variant="h5" sx={{ mt: 1.5 }} gutterBottom>
                    I&apos;m hiring
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Whether you&apos;re a family or an organisation, search verified talent, shortlist,
                    and hire with Oakvale managing the process.
                  </Typography>
                  <Button
                    component={Link}
                    href="/signup?role=employer"
                    variant="contained"
                    color="secondary"
                    sx={{ color: "#3A2E00" }}
                    endIcon={<HandshakeRoundedIcon />}
                  >
                    Hire Trusted Staff
                  </Button>
                </CardContent>
              </Card>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
