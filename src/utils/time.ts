import { Booking } from '@/types/booking';
import {
  TIMELINE_START_MIN,
  HOUR_WIDTH_PX,
  HOUR_HEIGHT_PX,
} from '@/constants/time';
import { SERVICES } from '@/constants/config';
import { isSameDay, parse, differenceInMinutes } from 'date-fns';

export function getToday(): Date {
  return new Date();
}

export function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minToTime(m: number) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function checkConflict(
  draft: Partial<Booking>,
  all: Partial<Booking>[]
): boolean {
  const svc = SERVICES.find((s) => s.id === draft.serviceId);
  if (!svc || !draft.startTime || !draft.date) return false;
  const ns = timeToMin(draft.startTime);
  const ne = ns + svc.durationMin;
  return all.some((b) => {
    if (b.id === draft.id) return false;
    if (b.bedKey !== draft.bedKey) return false;
    if (!isSameDay(b.date!, draft.date!)) return false;
    const bs = SERVICES.find((s) => s.id === b.serviceId);
    if (!bs) return false;
    const bStart = timeToMin(b.startTime!);
    const bEnd = bStart + bs.durationMin;
    return ns < bEnd && ne > bStart;
  });
}

// export const TIME_SLOTS: string[] = Array.from(
//   { length: (12 * 60) / 15 + 1 },
//   (_, i) => minToTime(TIMELINE_START_MIN + i * 15)
// );

export const TIME_SLOTS: string[] = Array.from(
  { length: (12 * 60) / 5 + 1 },
  (_, i) => minToTime(TIMELINE_START_MIN + i * 5)
);
export const HOUR_MARKS: string[] = Array.from({ length: 15 }, (_, i) =>
  minToTime(TIMELINE_START_MIN + i * 60)
);

export const MOBILE_HOUR_MARKS: string[] = Array.from(
  { length: 15 },
  (_, i) => `${8 + i}h`
);

export function convertTimeToPM(time24h: string, delimiter: string = 'h') {
  // Split the string into hours and minutes
  const [hours24, minutes] = time24h.split(':').map(Number);

  // Convert to 12-hour format
  const hours12 = hours24 % 12 || 12;

  return `${hours12}${delimiter}${minutes > 0 ? minutes : ''}`;
}

export function getEndTime(startTime: string, durationMinutes: number) {
  // 1. Split the string into hours and minutes
  const [hours, minutes] = startTime.split(':').map(Number);

  // 2. Create a base date (using today's date) and set the hours/minutes
  const date = new Date();
  date.setHours(hours, minutes + durationMinutes, 0, 0);

  // 3. Format the result back to HH:mm, ensuring 2-digit zero-padding
  return date.toTimeString().slice(0, 5);
}

export function getMinuteDistance(startTime: string, endTime: string): number {
  // Use any consistent base date to anchor the times
  const baseDate = new Date(2000, 0, 1);

  // Parse the hh:mm strings relative to the base date
  const date1 = parse(startTime, 'HH:mm', baseDate);
  const date2 = parse(endTime, 'HH:mm', baseDate);

  // Calculate the absolute minute difference
  return Math.abs(differenceInMinutes(date1, date2));
}

// export function getDateString(date: Date) {
//   const yyyyMmDd = date.toISOString().split('T')[0];
//   return yyyyMmDd;
// }

// export function dateStringToDate(dateStr: string) {
//   const [year, month, day] = dateStr.split('-').map(Number);

//   return new Date(year, month - 1, day);
// }

export function getDateWithOffset(date: Date, offsetMins: number) {
  const utcTimestamp = date.getTime();
  const offsetMillisecs =
    (offsetMins <= 0 ? 1 : -1) * Math.abs(offsetMins) * 60 * 1000;

  return new Date(utcTimestamp + offsetMillisecs);
}

export function compareDateString(d1: Date, d2: Date) {
  return d1.toLocaleDateString('en-CA') === d2.toLocaleDateString('en-CA');
}

/** TIMELINE */

// 'HH:MM' → absolute px left offset from 08:00
export function timeToLeftPx(time: string): number {
  return ((timeToMin(time) - TIMELINE_START_MIN) / 60) * HOUR_WIDTH_PX;
}

export function timeToTopPx(time: string): number {
  return ((timeToMin(time) - TIMELINE_START_MIN) / 60) * HOUR_HEIGHT_PX;
}

// duration in minutes → width in px
export function durationToWidthPx(durationMin: number): number {
  return (durationMin / 60) * HOUR_WIDTH_PX;
}

// duration in minutes → height in px
export function durationToHeightPx(durationMin: number): number {
  return (durationMin / 60) * HOUR_HEIGHT_PX;
}
