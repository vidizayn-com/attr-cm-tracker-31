// Treatment & report reminder scheduling — reusable domain logic.
//
// Canonical source of truth: Treatment Start Date (+ Patient Type for the schedule
// shape). Current Treatment Month itself is NOT recalculated here — it is imported
// from patientSchema.ts (calculateCurrentTreatmentMonth) to avoid a second
// implementation of that calendar-month-difference formula.
//
// Nothing here is persisted. Every value is derived on read from
// treatmentStartDate / patientType / lastReportDate + "today".

import { addMonths } from 'date-fns';
import { calculateCurrentTreatmentMonth } from './patientSchema';

export type PatientTypeValue = 'new' | 'continuing';

export type TreatmentReminderStatus = 'Upcoming' | 'Due' | 'Overdue';

export interface TreatmentFollowUpInfo {
  currentTreatmentMonth: number;
  nextTreatmentReminderDate: Date;
  previousTreatmentReminderDate: Date | null;
  treatmentReminderStatus: TreatmentReminderStatus;
}

// Report renewal period. Was 6 calendar months; changed per business rule update.
// Every site that computes "Next Report Renewal Date" from Last Report Date should
// import this constant rather than hardcoding 3 (or 6).
export const REPORT_RENEWAL_PERIOD_MONTHS = 3;

// There is no separate "treatment milestone completed" flag in the data model.
// Confirmed business rule: updating Last Report Date already means the most
// recent treatment milestone has been addressed — reuse that existing,
// already-tracked field as the completion signal instead of introducing a new
// one. A milestone is "Overdue" only while it has passed AND no report has been
// filed since it passed; once Last Report Date reaches or passes it, the
// schedule moves on and reports on the *next* milestone instead.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseLocalDateOnly(value: string | Date): Date | null {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const d = new Date(value.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const cleanStr = String(value).trim().split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

function startOfDay(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffInDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

// Local-calendar-safe "YYYY-MM-DD" formatting for a Date produced by this module.
// Deliberately does NOT use toISOString(), which converts to UTC and can shift
// the calendar day by ±1 for any timezone offset from UTC (e.g. Europe/Istanbul,
// UTC+3, turns a local midnight into the previous day's date in UTC). Pass the
// result through the existing isoToDdMmYyyy() for display, same as other dates
// in this app.
export function formatMilestoneDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Milestone offsets (in calendar months from Treatment Start Date), by 0-based index:
//   New Patient:        1, 3, 6, 9, 12, 15, 18, 21, ...
//   Continuing Patient:    3, 6, 9, 12, 15, 18, 21, ...
// New Patient gets a single +1 month onboarding reminder before joining the same
// every-3-months cadence Continuing Patients start on immediately.
function nthMilestoneOffsetMonths(patientType: string, n: number): number {
  if (patientType === 'new') {
    return n === 0 ? 1 : 3 * n;
  }
  return 3 * (n + 1);
}

function nthMilestoneDate(treatmentStartDate: Date, patientType: string, n: number): Date {
  return startOfDay(addMonths(treatmentStartDate, nthMilestoneOffsetMonths(patientType, n)));
}

// Smallest treatment milestone that is on or after `today`. Never returns a
// milestone strictly in the past — a Continuing Patient entered long after
// treatment start (e.g. Case C in the spec) must land on the next *future*
// milestone, not replay every historical one.
const MAX_MILESTONE_LOOKUP_ITERATIONS = 2000; // ~500 years at the coarsest (3mo) cadence — a safety cap, not a real limit

export function getNextTreatmentMilestone(
  treatmentStartDate: string | Date | null | undefined,
  patientType: string | null | undefined,
  today: Date = new Date()
): Date | null {
  if (!treatmentStartDate) return null;
  const start = parseLocalDateOnly(treatmentStartDate);
  if (!start) return null;
  const normalizedToday = startOfDay(today);
  const effectivePatientType = patientType === 'new' ? 'new' : 'continuing';

  for (let n = 0; n < MAX_MILESTONE_LOOKUP_ITERATIONS; n++) {
    const milestone = nthMilestoneDate(start, effectivePatientType, n);
    if (milestone.getTime() >= normalizedToday.getTime()) return milestone;
  }
  return null;
}

// The milestone immediately before the next one (i.e. the most recently-passed
// one), or null if treatment hasn't reached its first milestone yet.
export function getPreviousTreatmentMilestone(
  treatmentStartDate: string | Date | null | undefined,
  patientType: string | null | undefined,
  today: Date = new Date()
): Date | null {
  if (!treatmentStartDate) return null;
  const start = parseLocalDateOnly(treatmentStartDate);
  if (!start) return null;
  const normalizedToday = startOfDay(today);
  const effectivePatientType = patientType === 'new' ? 'new' : 'continuing';

  let previous: Date | null = null;
  for (let n = 0; n < MAX_MILESTONE_LOOKUP_ITERATIONS; n++) {
    const milestone = nthMilestoneDate(start, effectivePatientType, n);
    if (milestone.getTime() >= normalizedToday.getTime()) return previous;
    previous = milestone;
  }
  return previous;
}

export function getTreatmentReminderStatus(
  nextTreatmentReminderDate: Date,
  previousTreatmentReminderDate: Date | null,
  lastReportDate: string | Date | null | undefined,
  today: Date = new Date()
): TreatmentReminderStatus {
  const normalizedToday = startOfDay(today);

  if (diffInDays(nextTreatmentReminderDate, normalizedToday) === 0) {
    return 'Due';
  }
  if (previousTreatmentReminderDate) {
    const lastReport = lastReportDate ? parseLocalDateOnly(lastReportDate) : null;
    const coveredByReport = lastReport && lastReport.getTime() >= previousTreatmentReminderDate.getTime();
    if (!coveredByReport) {
      return 'Overdue';
    }
  }
  return 'Upcoming';
}

// Tafamidis treatment-continuation medical warning. Trigger is purely
// `currentTreatmentMonth === TAFAMIDIS_CONTINUATION_REVIEW_MONTH` — derived,
// not persisted. Copy is centralized here (not duplicated per UI surface) so
// every surface renders the exact same, unparaphrased medical text.
export const TAFAMIDIS_CONTINUATION_REVIEW_MONTH = 15;

export const TAFAMIDIS_CONTINUATION_WARNING = {
  label: 'Month 15 Treatment Review',
  title: 'Tafamidis Treatment Continuation Criteria',
  intro: 'At the end of Month 15, treatment may be continued provided that:',
  criteria: [
    'the patient has not been hospitalized for heart failure during the previous 6 months, AND',
    'the patient has not had an emergency visit requiring IV diuretics during the previous 6 months.',
  ],
  conclusion: 'If these criteria are not met, treatment should be discontinued.',
} as const;

// Single entry point combining all derived treatment follow-up values for a
// patient. Returns null when Treatment Start Date is missing — callers must
// treat that as "not available yet", not fabricate a date.
export function getTreatmentFollowUpInfo(
  treatmentStartDate: string | Date | null | undefined,
  patientType: string | null | undefined,
  lastReportDate: string | Date | null | undefined = null,
  today: Date = new Date()
): TreatmentFollowUpInfo | null {
  if (!treatmentStartDate) return null;

  const currentTreatmentMonth = calculateCurrentTreatmentMonth(
    treatmentStartDate instanceof Date ? formatMilestoneDateIso(treatmentStartDate) : treatmentStartDate
  );
  const nextTreatmentReminderDate = getNextTreatmentMilestone(treatmentStartDate, patientType, today);
  if (currentTreatmentMonth === null || !nextTreatmentReminderDate) return null;

  const previousTreatmentReminderDate = getPreviousTreatmentMilestone(treatmentStartDate, patientType, today);
  const treatmentReminderStatus = getTreatmentReminderStatus(
    nextTreatmentReminderDate,
    previousTreatmentReminderDate,
    lastReportDate,
    today
  );

  return {
    currentTreatmentMonth,
    nextTreatmentReminderDate,
    previousTreatmentReminderDate,
    treatmentReminderStatus,
  };
}
