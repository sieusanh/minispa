import { IBase } from './base';

export interface Service extends IBase {
  nameVi: string;
  subName: string;
  durationMin: number;
  priceVnd: number;
}
