/**
 * Availability checker — JSON-backed, honest about what it knows.
 *
 * This is NOT a live booking system and must never present itself as one. It reads
 * src/data/blocked-dates.json, which the owners maintain by hand, and reports one of
 * three states. Every surface that renders a result must also show when the data was
 * last updated and that the date is confirmed within 24 hours (see AVAILABILITY_COPY).
 *
 * Design decision: the file records EXCEPTIONS ONLY. A date with no entry is Available.
 * Asking the owners to maintain a list of open dates would guarantee the file goes
 * stale; asking them to add the handful of days they book is maintainable.
 *
 * Package capacities are passed in rather than imported, because all pricing and
 * capacity data has exactly one home — src/config/pricing.ts, derived from
 * LAKESIDE-CURRENT-WEBSITE-INFO.md. Duplicating capacities here would break that rule.
 */

export type AvailabilityStatus = 'available' | 'limited' | 'booked';

/** A recorded exception. Absence of an entry means the date is available. */
export interface BlockedDateEntry {
  /** ISO calendar date, yyyy-mm-dd. */
  date: string;
  status: 'limited' | 'booked';
  /** For 'limited': the largest guest count still servable that day. */
  remainingGuestCapacity?: number;
  /** Shown to the visitor verbatim. Keep it plain and specific. */
  note?: string;
}

export interface BlockedDatesFile {
  lastUpdated: string;
  dates: BlockedDateEntry[];
}

export interface AvailabilityQuery {
  /** ISO calendar date, yyyy-mm-dd. */
  date: string;
  /** Optional. When given, it is cross-checked against package capacity. */
  guestCount?: number;
}

export interface CapacityInfo {
  /** Largest guest count a single package seats. From pricing config. */
  maxSingleTentGuests: number;
  /** Smallest package's guest capacity, for the "we have something that fits" case. */
  minPackageGuests: number;
}

export interface AvailabilityResult {
  status: AvailabilityStatus;
  /** The date that was asked about. */
  date: string;
  /** Owner's note for the date, when there is one. */
  note?: string;
  /**
   * Set when the requested guest count exceeds what a single package seats. The date
   * may still be open — this is a separate concern from availability, and the UI must
   * not conflate them.
   */
  capacityWarning?: string;
  /** Populated when status is 'booked': the next three open dates after the request. */
  nextOpenDates: string[];
  /** ISO date the underlying file was last edited by the owners. */
  lastUpdated: string;
}

const DAY_MS = 86_400_000;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseISODate(iso: string): Date {
  // Parse as UTC midnight so day arithmetic never crosses a DST boundary.
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Finds the next `count` dates at or after `fromISO` that are fully available.
 * A 'limited' date is not offered as an alternative — offering a day that might not
 * fit the customer's event is worse than offering fewer options.
 */
export function findNextOpenDates(
  fromISO: string,
  entries: readonly BlockedDateEntry[],
  count = 3,
  searchLimitDays = 365,
): string[] {
  const blocked = new Set(entries.map((e) => e.date));
  const out: string[] = [];
  let cursor = parseISODate(fromISO).getTime() + DAY_MS;

  for (let i = 0; i < searchLimitDays && out.length < count; i++) {
    const iso = toISODate(new Date(cursor));
    if (!blocked.has(iso)) out.push(iso);
    cursor += DAY_MS;
  }
  return out;
}

export function checkAvailability(
  query: AvailabilityQuery,
  file: BlockedDatesFile,
  capacity: CapacityInfo,
): AvailabilityResult {
  const entry = file.dates.find((e) => e.date === query.date);

  let capacityWarning: string | undefined;
  if (query.guestCount !== undefined && query.guestCount > capacity.maxSingleTentGuests) {
    capacityWarning = `A single tent seats up to ${capacity.maxSingleTentGuests}. For ${query.guestCount} guests we would plan multiple tents — give us a call and we will work it out.`;
  }

  const base = {
    date: query.date,
    lastUpdated: file.lastUpdated,
    capacityWarning,
  };

  if (!entry) {
    return { ...base, status: 'available', nextOpenDates: [] };
  }

  if (entry.status === 'booked') {
    return {
      ...base,
      status: 'booked',
      note: entry.note,
      nextOpenDates: findNextOpenDates(query.date, file.dates),
    };
  }

  // 'limited' — if the party is larger than what is left, treat it as booked for this
  // customer and offer alternatives rather than inviting a request we cannot fill.
  const remaining = entry.remainingGuestCapacity;
  if (query.guestCount !== undefined && remaining !== undefined && query.guestCount > remaining) {
    return {
      ...base,
      status: 'booked',
      note: entry.note,
      nextOpenDates: findNextOpenDates(query.date, file.dates),
    };
  }

  return { ...base, status: 'limited', note: entry.note, nextOpenDates: [] };
}

/**
 * Required copy. Every rendered result shows the freshness line and the confirmation
 * line. These are not optional garnish — they are what keeps the checker honest.
 */
export const AVAILABILITY_COPY = {
  available: 'That date looks open.',
  limited: 'That date is partly booked.',
  booked: "That date is booked.",
  /** Interpolate the file's lastUpdated. */
  freshness: (lastUpdated: string) => `Availability current as of ${lastUpdated}.`,
  confirmation: 'We confirm every date within 24 hours.',
  nextOpenLead: 'The next open dates are:',
} as const;
