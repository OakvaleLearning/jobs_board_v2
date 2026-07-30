import { NIGERIAN_STATES } from "@/lib/constants";
import type { AssessmentType } from "@/generated/prisma/client";

export type AssessmentField =
  | { name: string; label: string; type: "text" | "number" | "textarea" }
  | { name: string; label: string; type: "select"; options: string[] };

/** Diaspora Care Needs Assessment (brief §10.1). */
export const careNeedsFields: AssessmentField[] = [
  { name: "recipientName", label: "Care recipient name", type: "text" },
  { name: "recipientAge", label: "Age", type: "number" },
  { name: "relationship", label: "Relationship to you", type: "text" },
  { name: "medicalConditions", label: "Medical conditions & mobility status", type: "textarea" },
  { name: "medication", label: "Medication management requirements", type: "textarea" },
  {
    name: "specialistNeeds",
    label: "Specialist care needs",
    type: "select",
    options: ["None", "Post-surgical", "Dementia", "Palliative", "Other"],
  },
  {
    name: "languagePreference",
    label: "Language preference",
    type: "select",
    options: ["English", "Yoruba", "Igbo", "Hausa", "Other"],
  },
  { name: "culturalDietary", label: "Cultural or dietary requirements", type: "textarea" },
  { name: "accommodation", label: "Accommodation", type: "select", options: ["Live-in", "Live-out"] },
  { name: "hoursPerDay", label: "Hours per day", type: "number" },
  { name: "daysPerWeek", label: "Days per week", type: "number" },
  { name: "state", label: "State", type: "select", options: NIGERIAN_STATES },
  { name: "lga", label: "LGA / area", type: "text" },
  {
    name: "urgency",
    label: "Urgency",
    type: "select",
    options: ["Immediate — within 2 weeks", "Planned — within 1 month", "Future"],
  },
  { name: "budget", label: "Budget indication (optional)", type: "text" },
];

/** Corporate Crèche Workforce Requirements (brief §10.2). */
export const workforceFields: AssessmentField[] = [
  { name: "staffRequired", label: "Number of crèche staff required", type: "number" },
  {
    name: "ageRanges",
    label: "Age range of children served",
    type: "select",
    options: ["0–12 months", "1–3 years", "3–5 years", "Mixed (all ages)"],
  },
  { name: "hoursOfOperation", label: "Hours of operation", type: "text" },
  { name: "specificSkills", label: "Specific skills required (SEND, Montessori, infant first aid…)", type: "textarea" },
  { name: "upskillStaff", label: "Existing staff to upskill (number & names)", type: "textarea" },
  { name: "budget", label: "Budget parameters (optional)", type: "text" },
];

export function fieldsForType(type: AssessmentType): AssessmentField[] {
  return type === "CARE_NEEDS" ? careNeedsFields : workforceFields;
}

/** The assessment a given employer kind must complete. */
export function assessmentTypeForKind(kind: string): AssessmentType {
  return kind === "ORGANIZATION" ? "WORKFORCE_REQUIREMENTS" : "CARE_NEEDS";
}
