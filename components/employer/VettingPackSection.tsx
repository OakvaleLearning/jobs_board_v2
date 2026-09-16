"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import Link from "next/link";

export type VettingPackProps = {
  workerId: string;
  workerName: string;
  /** Whether the viewer's plan unlocks the pack (Diaspora Sponsors). */
  unlocked: boolean;
  /** Signed URL of the candidate's 60–90s video introduction, if on file. */
  videoUrl: string | null;
  checks: { label: string; value: string; ok: boolean }[];
};

/**
 * US-2.1 — the Enhanced Vetting Pack.
 *
 * Diaspora Sponsors get the video introduction and the downloadable
 * verification bundle. Local subscribers see the section, locked, with an
 * explanation of what it is and who it's for — AC2 asks for an upgrade modal,
 * not a hidden feature.
 */
export default function VettingPackSection({
  workerId,
  workerName,
  unlocked,
  videoUrl,
  checks,
}: VettingPackProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <VerifiedUserRoundedIcon color={unlocked ? "primary" : "disabled"} />
            <Typography variant="h6">Enhanced Vetting Pack</Typography>
            {!unlocked && <Chip icon={<LockRoundedIcon />} label="Diaspora Sponsors" size="small" />}
          </Box>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            Assess {workerName} without meeting in person: a short video introduction and a
            downloadable bundle covering verified ID, police clearance status and their Oakvale
            transcript.
          </Typography>

          {unlocked ? (
            <>
              {videoUrl ? (
                <Box
                  component="video"
                  src={videoUrl}
                  controls
                  preload="metadata"
                  sx={{
                    width: "100%",
                    maxHeight: 360,
                    borderRadius: 2,
                    bgcolor: "common.black",
                    mb: 2,
                  }}
                />
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This candidate hasn&apos;t uploaded a video introduction yet.
                </Alert>
              )}

              <Stack spacing={1} sx={{ mb: 2 }}>
                {checks.map((c) => (
                  <Box
                    key={c.label}
                    sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {c.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                      color={c.ok ? "success.main" : "text.secondary"}
                    >
                      {c.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Button
                component="a"
                href={`/employer/workers/${workerId}/vetting-pack`}
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
              >
                Download verification bundle (PDF)
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<LockRoundedIcon />}
              onClick={() => setUpgradeOpen(true)}
            >
              Open Enhanced Vetting Pack
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PublicRoundedIcon color="primary" /> A Diaspora Sponsor feature
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            The Enhanced Vetting Pack is built for sponsors hiring from abroad, who can&apos;t meet a
            candidate in person before deciding. It includes:
          </Typography>
          <Stack spacing={1.25} sx={{ mb: 2 }}>
            <Typography variant="body2">• A 60–90 second video introduction from the candidate</Typography>
            <Typography variant="body2">• Verified government ID confirmation</Typography>
            <Typography variant="body2">• Police clearance status</Typography>
            <Typography variant="body2">• Oakvale transcript summary, as a downloadable PDF</Typography>
          </Stack>
          <Alert severity="info">
            Your account is registered as a local employer hiring within Nigeria. Every candidate you
            see is already Oakvale-certified with verified ID and police clearance status shown on
            their profile — the pack bundles that evidence for remote assessment.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeOpen(false)}>Close</Button>
          <Button component={Link} href="/employer/plans" variant="contained">
            Compare plans
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
