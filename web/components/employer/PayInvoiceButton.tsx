"use client";

import { useTransition, useState } from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/navigation";
import { payInvoice } from "@/app/employer/billing-actions";

export default function PayInvoiceButton({ invoiceId, devMode }: { invoiceId: string; devMode: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <>
      <Button
        variant="contained"
        size="small"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await payInvoice(invoiceId);
            if (res.url) window.location.href = res.url;
            else if (res.paid) router.refresh();
            else if (res.error) setError(res.error);
          })
        }
      >
        {devMode ? "Simulate payment" : "Pay now"}
      </Button>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
