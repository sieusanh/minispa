import { IBase } from './base';

export enum UserRole {
  ADMIN = 'admin',
  TECHNICIAN = 'technician',
}

export interface Staff extends IBase {
  authId: string;
  name: string;
  phone: string;
  zaloId?: string;
  role: UserRole;
  revenueShareRate: number;
  currentMonthRevenue: number;
  review?: string;
  username: string;
  password: string;
}

// export type StaffRecord = Record<keyof Staff, Staff[keyof Staff]>;
export interface LoginPayload {
  username: string;
  password: string;
}
