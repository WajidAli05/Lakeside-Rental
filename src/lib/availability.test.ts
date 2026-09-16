/**
 * Availability checker tests.
 *
 * Written runner-agnostically against a tiny local harness so they run today, before
 * a test runner is installed. Phase 1 should port these to vitest — the assertions
 * carry over unchanged.
 *
 *   node --experimental-strip-types src/lib/availability.test.ts
 */

import { checkAvailability, findNextOpenDates, type BlockedDatesFile } from './availability.ts';

const FILE: BlockedDatesFile = {
  lastUpdated: '2026-09-16',
  dates: [
    { date: '2027-06-12', status: 'booked' },
    { date: '2027-06-19', status: 'limited', remainingGuestCapacity: 80 },
    { date: '2027-07-03', status: 'booked' },
    { date: '2027-07-04', status: 'booked' },
    { date: '2027-08-21', status: 'limited', remainingGuestCapacity: 48 },
  ],
};

/** Capacities come from pricing config in the app; fixed here so the test is hermetic. */
const CAPACITY = { maxSingleTentGuests: 144, minPackageGuests: 48 };

let pass = 0;
let fail = 0;

function expect(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) {
    pass++;
    console.log(`PASS  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name}\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`);
  }
}

// A date nobody has blocked is available. This is the whole point of the
// exceptions-only file format.
expect('unlisted date is available', checkAvailability({ date: '2027-05-01' }, FILE, CAPACITY).status, 'available');

expect('booked date is booked', checkAvailability({ date: '2027-06-12' }, FILE, CAPACITY).status, 'booked');
expect('booked offers three alternatives', checkAvailability({ date: '2027-06-12' }, FILE, CAPACITY).nextOpenDates.length, 3);

// A 'limited' day fits a small party...
expect('limited stays limited when the party fits', checkAvailability({ date: '2027-06-19', guestCount: 60 }, FILE, CAPACITY).status, 'limited');
// ...but is effectively booked for a party larger than what is left.
expect('limited becomes booked when the party is too big', checkAvailability({ date: '2027-06-19', guestCount: 120 }, FILE, CAPACITY).status, 'booked');
expect('limited without a guest count stays limited', checkAvailability({ date: '2027-06-19' }, FILE, CAPACITY).status, 'limited');

// Capacity is a separate concern from availability and must not be conflated with it.
expect('capacity warning above the largest package', !!checkAvailability({ date: '2027-05-01', guestCount: 200 }, FILE, CAPACITY).capacityWarning, true);
expect('no capacity warning at exactly the largest package', !!checkAvailability({ date: '2027-05-01', guestCount: 144 }, FILE, CAPACITY).capacityWarning, false);
expect('an open date with too many guests is still available', checkAvailability({ date: '2027-05-01', guestCount: 200 }, FILE, CAPACITY).status, 'available');

expect('result carries lastUpdated for the freshness line', checkAvailability({ date: '2027-05-01' }, FILE, CAPACITY).lastUpdated, '2026-09-16');

// Back-to-back blocked days must both be skipped when suggesting alternatives.
expect('alternatives skip consecutive blocked days', findNextOpenDates('2027-07-02', FILE.dates, 3), ['2027-07-05', '2027-07-06', '2027-07-07']);

// 'limited' days are never offered as alternatives — suggesting a day that might not
// fit is worse than offering fewer options.
expect('alternatives skip limited days too', findNextOpenDates('2027-06-18', FILE.dates, 2), ['2027-06-20', '2027-06-21']);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
