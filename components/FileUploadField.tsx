"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";

export default function FileUploadField({
  name = "file",
  accept = "image/*,application/pdf",
  helperText,
  error,
}: {
  name?: string;
  accept?: string;
  helperText?: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <Box>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0] && inputRef.current) {
            inputRef.current.files = e.dataTransfer.files;
            setFileName(e.dataTransfer.files[0].name);
          }
        }}
        sx={{
          border: "1.5px dashed",
          borderColor: error ? "error.main" : dragOver ? "primary.main" : "divider",
          bgcolor: dragOver ? "rgba(27,94,32,0.04)" : "background.paper",
          borderRadius: 3,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { borderColor: "primary.main", bgcolor: "rgba(27,94,32,0.03)" },
        }}
      >
        {fileName ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <InsertDriveFileRoundedIcon color="primary" />
            <Typography noWrap sx={{ fontWeight: 600, maxWidth: 260 }}>
              {fileName}
            </Typography>
          </Box>
        ) : (
          <>
            <CloudUploadRoundedIcon sx={{ fontSize: 34, color: "text.secondary", mb: 0.5 }} />
            <Typography sx={{ fontWeight: 600 }}>Click or drag a file to upload</Typography>
            <Typography variant="body2" color="text.secondary">
              JPG, PNG, or PDF · up to 8MB (images are compressed automatically)
            </Typography>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          hidden
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </Box>
      {fileName && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => inputRef.current?.click()}>
          Choose a different file
        </Button>
      )}
      {(error || helperText) && (
        <Typography variant="caption" color={error ? "error" : "text.secondary"} sx={{ mt: 0.5, display: "block" }}>
          {error || helperText}
        </Typography>
      )}
    </Box>
  );
}
