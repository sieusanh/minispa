import { IBase } from './base';

export interface Customer extends IBase {
  name: string;
  phone: string;
  source: CustomerSource;
  visitCount: number;
  review?: string;
}

export type CustomerSource = 'dot_xuat' | 'tiktok' | 'ban_be';
