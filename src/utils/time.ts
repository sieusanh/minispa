import { Booking } from '@/types/booking';
import { TIMELINE_START_MIN } from '@/constants/time';
import { SERVICES } from '@/constants/config';
import { isSameDay } from 'date-fns';

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
    if (b.bedNumber !== draft.bedNumber) return false;
    if (!isSameDay(b.date!, draft.date!)) return false;
    const bs = SERVICES.find((s) => s.id === b.serviceId);
    if (!bs) return false;
    const bStart = timeToMin(b.startTime!);
    const bEnd = bStart + bs.durationMin;
    return ns < bEnd && ne > bStart;
  });
}

export const TIME_SLOTS: string[] = Array.from(
  { length: (12 * 60) / 15 + 1 },
  (_, i) => minToTime(TIMELINE_START_MIN + i * 15)
);

export const HOUR_MARKS: string[] = Array.from({ length: 13 }, (_, i) =>
  minToTime(TIMELINE_START_MIN + i * 60)
);
