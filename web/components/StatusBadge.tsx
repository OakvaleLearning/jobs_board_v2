import Chip from "@mui/material/Chip";

type StatusMeta = { label: string; color: "default" | "success" | "warning" | "error" | "info" };

export default function StatusBadge({
  meta,
  size = "small",
}: {
  meta: StatusMeta;
  size?: "small" | "medium";
}) {
  return (
    <Chip
      label={meta.label}
      color={meta.color === "default" ? undefined : meta.color}
      variant={meta.color === "default" ? "outlined" : "filled"}
      size={size}
    />
  );
}
