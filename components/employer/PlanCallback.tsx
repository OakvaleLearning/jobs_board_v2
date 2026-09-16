"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { verifyPlanPayment } from "@/app/employer/plan-actions";

/**
 * Verifies a gateway callback reference once after the employer is redirected
 * back from checkout, then refreshes so the new plan / credit balance shows.
 */
export default function PlanCallback({ reference }: { reference: string }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    verifyPlanPayment(reference).then((ok) => {
      if (ok) router.refresh();
    });
  }, [reference, router]);

  return null;
}
