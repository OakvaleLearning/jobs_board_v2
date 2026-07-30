import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";

export default function DocLinks({
  docs,
}: {
  docs: { label: string; fileUrl: string }[];
}) {
  if (docs.length === 0) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
      {docs.map((d) => (
        <Chip
          key={d.fileUrl}
          component="a"
          href={d.fileUrl}
          target="_blank"
          rel="noopener"
          clickable
          icon={<InsertDriveFileRoundedIcon />}
          label={d.label}
          variant="outlined"
          size="small"
        />
      ))}
    </Stack>
  );
}
