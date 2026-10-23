export type StaffSectionId =
  | "today"
  | "this-week"
  | "this-month"
  | "overview"
  | "training"
  | "recruiting";

export type StaffSection = {
  id: StaffSectionId;
  label: string;
  blurb: string;
  /** Placeholder option slots — expand heavily later. */
  optionSlots: string[];
};

export const STAFF_SECTIONS: StaffSection[] = [
  {
    id: "today",
    label: "Today",
    blurb: "Who’s working, open gaps, and same-day staffing actions.",
    optionSlots: [
      "Shift board / who’s on (coming)",
      "Call-offs & coverage requests (coming)",
      "Same-day notes & handoffs (coming)",
    ],
  },
  {
    id: "this-week",
    label: "This Week",
    blurb: "Week view of coverage, agency use, and upcoming holes.",
    optionSlots: [
      "7-day coverage grid (coming)",
      "Open shifts this week (coming)",
      "Weekend readiness checklist (coming)",
    ],
  },
  {
    id: "this-month",
    label: "This Month",
    blurb: "Monthly staffing pulse — trends, overtime, and planning.",
    optionSlots: [
      "Month calendar / PPD snapshot (coming)",
      "Overtime & agency spend notes (coming)",
      "Hiring pipeline milestones (coming)",
    ],
  },
  {
    id: "overview",
    label: "Staff Overview",
    blurb: "Roster, roles, credentials, and facility staffing picture.",
    optionSlots: [
      "Roster by role / unit (coming)",
      "Credentials & license status (coming)",
      "Ratio / acuity notes (coming)",
    ],
  },
  {
    id: "training",
    label: "Staff Training",
    blurb: "Required education, competencies, and in-service tracking.",
    optionSlots: [
      "Mandatory training status (coming)",
      "Competency checklists (coming)",
      "Link to Training lane videos (coming)",
    ],
  },
  {
    id: "recruiting",
    label: "Recruiting",
    blurb: "Open positions, applicants, and recruiting outreach.",
    optionSlots: [
      "Open positions board (coming)",
      "Applicant pipeline (coming)",
      "Posting / outreach tools (coming)",
    ],
  },
];

export function staffSectionById(id: string): StaffSection | undefined {
  return STAFF_SECTIONS.find((s) => s.id === id);
}
