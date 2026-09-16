import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/format";

export type CareLogEntryView = {
  id: string;
  loggedFor: Date;
  bloodPressure: string | null;
  temperature: number | null;
  pulse: number | null;
  weight: number | null;
  medicationsTaken: string | null;
  medicationTime: string | null;
  meals: string | null;
  activities: string | null;
  mood: string | null;
  notes: string | null;
  concernFlag: boolean;
};

/** Read-only view of filed care log entries, newest first. */
export default function CareLogTimeline({
  entries,
  emptyText = "No care logs have been filed yet.",
}: {
  entries: CareLogEntryView[];
  emptyText?: string;
}) {
  if (entries.length === 0) {
    return <EmptyState title="No entries yet" description={emptyText} />;
  }

  return (
    <Stack spacing={2}>
      {entries.map((e) => {
        const metrics = [
          e.bloodPressure && { label: "BP", value: e.bloodPressure },
          e.temperature != null && { label: "Temp", value: `${e.temperature}°C` },
          e.pulse != null && { label: "Pulse", value: `${e.pulse} bpm` },
          e.weight != null && { label: "Weight", value: `${e.weight} kg` },
        ].filter(Boolean) as { label: string; value: string }[];

        const details = [
          e.medicationsTaken && {
            label: "Medication",
            value: e.medicationTime ? `${e.medicationsTaken} (${e.medicationTime})` : e.medicationsTaken,
          },
          e.meals && { label: "Meals", value: e.meals },
          e.activities && { label: "Activities", value: e.activities },
          e.mood && { label: "Mood", value: e.mood },
          e.notes && { label: "Notes", value: e.notes },
        ].filter(Boolean) as { label: string; value: string }[];

        return (
          <Card
            key={e.id}
            variant="outlined"
            sx={{ borderColor: e.concernFlag ? "error.main" : undefined }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 700 }}>{formatDate(e.loggedFor)}</Typography>
                {e.concernFlag && (
                  <Chip
                    icon={<WarningAmberRoundedIcon />}
                    label="Needs attention"
                    color="error"
                    size="small"
                  />
                )}
              </Box>

              {metrics.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                  {metrics.map((m) => (
                    <Chip
                      key={m.label}
                      label={`${m.label}: ${m.value}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}

              {metrics.length > 0 && details.length > 0 && <Divider sx={{ mb: 1.5 }} />}

              <Stack spacing={0.75}>
                {details.map((d) => (
                  <Box key={d.label}>
                    <Typography variant="caption" color="text.secondary">
                      {d.label}
                    </Typography>
                    <Typography variant="body2">{d.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
