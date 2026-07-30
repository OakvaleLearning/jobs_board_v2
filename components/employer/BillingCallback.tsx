"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { verifyInvoicePayment } from "@/app/employer/billing-actions";

/** Verifies a Paystack callback reference once after redirect back to billing. */
export default function BillingCallback({ reference }: { reference: string }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    verifyInvoicePayment(reference).then((ok) => {
      if (ok) router.refresh();
    });
  }, [reference, router]);
  return null;
}
