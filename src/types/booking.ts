import { IBase } from './base';

export enum BookingStatus {
  OPEN = 'open',
  UPCOMING = 'upcoming',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export interface Booking extends IBase {
  customerName: string;
  phone: string;
  serviceId: string;
  bedNumber: '1' | '2' | '3' | '4' | '5';
  date: Date;
  startTime: string;
  staffId: string;
  note?: string;
  status: BookingStatus;
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
