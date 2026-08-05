"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import Link from "next/link";
import { requestInterview, makeOffer, setApplicationStatus } from "@/app/employer/hiring-actions";
import { initialFormState } from "@/lib/forms";
import { employmentTypeLabels, currencyLabels } from "@/lib/constants";
import SubmitButton from "@/components/SubmitButton";
import type { EmploymentType, Currency } from "@/generated/prisma/client";

const EMPLOYMENT_TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "SHIFT", "LIVE_IN", "CONTRACT"];

export default function ApplicantActions({
  applicationId,
  workerProfileId,
  status,
  jobTitle,
}: {
  applicationId: string;
  workerProfileId: string;
  status: string;
  jobTitle: string;
}) {
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [ivState, ivAction] = useActionState(requestInterview, initialFormState);
  const [offerState, offerAction] = useActionState(makeOffer, initialFormState);

  useEffect(() => {
    if (ivState.ok) setInterviewOpen(false);
  }, [ivState.ok]);
  useEffect(() => {
    if (offerState.ok) setOfferOpen(false);
  }, [offerState.ok]);

  const terminal = status === "HIRED" || status === "DECLINED" || status === "REJECTED";

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button component={Link} href={`/employer/workers/${workerProfileId}`} size="small" variant="outlined">
          View profile
        </Button>
        {!terminal && (
          <>
            <Button
              size="small"
              startIcon={<EventRoundedIcon />}
              onClick={() => setInterviewOpen(true)}
            >
              {status === "INTERVIEW" ? "Reschedule" : "Interview"}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<LocalOfferRoundedIcon />}
              onClick={() => setOfferOpen(true)}
            >
              {status === "OFFER" ? "Update offer" : "Make offer"}
            </Button>
            <Button
              size="small"
              color="error"
              disabled={pending}
              onClick={() => startTransition(() => setApplicationStatus(applicationId, "REJECTED"))}
            >
              Reject
            </Button>
          </>
        )}
      </Stack>

      {/* Interview dialog */}
      <Dialog open={interviewOpen} onClose={() => setInterviewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request an interview</DialogTitle>
        <form action={ivAction}>
          <DialogContent>
            <input type="hidden" name="applicationId" value={applicationId} />
            <Stack spacing={2} sx={{ mt: 1 }}>
              {ivState.message && !ivState.ok && <Alert severity="error">{ivState.message}</Alert>}
              <TextField select name="format" label="Interview format" defaultValue="VIDEO" size="small">
                <MenuItem value="VIDEO">Video call</MenuItem>
                <MenuItem value="PHONE">Phone call</MenuItem>
                <MenuItem value="IN_PERSON">In person</MenuItem>
              </TextField>
              <TextField
                name="times"
                type="datetime-local"
                label="Proposed time 1"
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!ivState.fieldErrors?.times}
                helperText={ivState.fieldErrors?.times}
              />
              <TextField name="times" type="datetime-local" label="Proposed time 2 (optional)" size="small" slotProps={{ inputLabel: { shrink: true } }} />
              <TextField name="times" type="datetime-local" label="Proposed time 3 (optional)" size="small" slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInterviewOpen(false)}>Cancel</Button>
            <SubmitButton>Send request</SubmitButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Offer dialog */}
      <Dialog open={offerOpen} onClose={() => setOfferOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Make an offer</DialogTitle>
        <form action={offerAction}>
          <DialogContent>
            <input type="hidden" name="applicationId" value={applicationId} />
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {offerState.message && !offerState.ok && (
                <Grid size={12}>
                  <Alert severity="error">{offerState.message}</Alert>
                </Grid>
              )}
              <Grid size={12}>
                <TextField
                  name="roleTitle"
                  label="Role title"
                  defaultValue={jobTitle}
                  size="small"
                  error={!!offerState.fieldErrors?.roleTitle}
                  helperText={offerState.fieldErrors?.roleTitle}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="startDate"
                  type="date"
                  label="Start date"
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!offerState.fieldErrors?.startDate}
                  helperText={offerState.fieldErrors?.startDate}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select name="employmentType" label="Employment type" defaultValue="FULL_TIME" size="small">
                  {EMPLOYMENT_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {employmentTypeLabels[t]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select name="salaryCurrency" label="Currency" defaultValue="NGN" size="small">
                  {(Object.keys(currencyLabels) as Currency[]).map((c) => (
                    <MenuItem key={c} value={c}>
                      {currencyLabels[c]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="salary"
                  type="number"
                  label="Monthly salary"
                  size="small"
                  error={!!offerState.fieldErrors?.salary}
                  helperText={offerState.fieldErrors?.salary}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField name="hours" label="Working hours" size="small" placeholder="e.g. Mon–Fri, 8am–4pm" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField name="location" label="Location" size="small" />
              </Grid>
              <Grid size={12}>
                <TextField name="conditions" label="Conditions (optional)" size="small" multiline minRows={2} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOfferOpen(false)}>Cancel</Button>
            <SubmitButton>Submit offer</SubmitButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
