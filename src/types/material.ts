import { IBase } from './base';

export type Durability = 'tot' | 'trung_binh' | 'can_thay';

export interface Material extends IBase {
  name: string;
  code: string;
  durability: Durability;
  quantity: number;
}
