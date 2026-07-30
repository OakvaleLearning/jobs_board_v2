import type { ZodError } from "zod";

/** Shared shape returned by all form Server Actions for useActionState. */
export type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialFormState: FormState = { ok: false };

/** Flatten a ZodError into a { field: firstMessage } map. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
