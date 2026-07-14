import { IBase } from './base';

// export enum BookingStatus {
//   OPEN = 'open',
//   UPCOMING = 'upcoming',
//   IN_PROGRESS = 'in_progress',
//   DONE = 'done',
//   CANCELLED = 'cancelled',
// }
export enum BookingStatus {
  DONE = 'done',
  IN_PROGRESS = 'in_progress',
  UPCOMING = 'upcoming',
  OPEN = 'open',
}

export enum BedKey {
  BED_1 = '1',
  BED_2 = '2',
  BED_3 = '3',
  BED_4 = '4',
  //   BED_5 = '5',
}

export interface Booking extends IBase {
  customerName: string;
  //   phone: string;
  serviceId: string;
  bedKey: BedKey;
  date: Date;
  startTime: string;
  staffId: string;
  staffName?: string;
  note?: string;
  price: number;
  commission?: number;
  status: BookingStatus;
  notified: boolean;
}

export interface VacancyState {
  bedKey: string;
  available: boolean;
  nowStartTime?: string;
  waitTime?: number;
}

// export interface Booking {
//   id?: string;
//   customerName: string;
//   phone: string;
//   serviceId: string;
//   bedNumber: '1' | '2' | '3' | '4';
//   date: Date;
//   startTime: string;
//   staffId: string;
//   note: string;
//   status: BookingStatus;
// }
