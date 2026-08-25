import type { ZodError } from "zod";

/** A single submitted field, echoed back so the client can repopulate it. */
export type FormValues = Record<string, string | string[]>;

/** Shared shape returned by all form Server Actions for useActionState. */
export type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /**
   * The raw values the user submitted. React 19 automatically resets an
   * uncontrolled `<form action={fn}>` after the action runs — including on a
   * failed submission — so we echo the values back and use them as the
   * inputs' `defaultValue`. The reset then restores what the user typed
   * instead of clearing it. Only set on failure; on success it is omitted so
   * "add" forms clear and edit forms pick up freshly revalidated defaults.
   */
  values?: FormValues;
};

export const initialFormState: FormState = { ok: false };

/** Shown at the top of a form when server-side validation fails. */
export const FORM_ERROR_MESSAGE = "Please fix the highlighted fields and try again.";

/** Flatten a ZodError into a { field: firstMessage } map. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Capture every submitted field as a string (or string[] for `multi` fields
 * such as checkbox groups). `multi` keys are always present — even when the
 * user cleared every option — so the client can tell "submitted nothing"
 * apart from "not submitted".
 */
export function formValues(formData: FormData, multi: string[] = []): FormValues {
  const out: FormValues = {};
  for (const key of multi) out[key] = formData.getAll(key).map(String);
  for (const key of formData.keys()) {
    if (key in out) continue;
    out[key] = String(formData.get(key) ?? "");
  }
  return out;
}

/** Build the failure state for a form action: message + field errors + echoed input. */
export function invalidForm(
  formData: FormData,
  error: ZodError,
  multi: string[] = [],
): FormState {
  return {
    ok: false,
    message: FORM_ERROR_MESSAGE,
    fieldErrors: zodFieldErrors(error),
    values: formValues(formData, multi),
  };
}

/**
 * Read a single-value field for use as a `defaultValue`, preferring the value
 * the user just submitted (echoed back on error) and falling back to the
 * server-provided default.
 */
export function keepValue(
  values: FormValues | undefined,
  key: string,
  fallback = "",
): string {
  const v = values?.[key];
  if (v == null) return fallback;
  return Array.isArray(v) ? (v[0] == null ? fallback : String(v[0])) : String(v);
}

/** Multi-value counterpart of {@link keepValue} for checkbox groups. */
export function keepValues(
  values: FormValues | undefined,
  key: string,
  fallback: string[] = [],
): string[] {
  const v = values?.[key];
  if (v == null) return fallback;
  return Array.isArray(v) ? v.map(String) : [String(v)];
}
