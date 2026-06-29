import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IBase } from '@/types';

// mergeClassNames
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// data transform
type AnyRecord = Record<string, unknown>;

// camelCase → snake_case (before INSERT / UPDATE)
export function toSnake<T extends IBase>(obj: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/([A-Z])/g, '_$1').toLowerCase(),
      v,
    ])
  ) as unknown as T;
}

// snake_case → camelCase (after SELECT)
export function toCamel<T extends IBase>(obj: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      v,
    ])
  ) as unknown as T;
}

export function transformDataInput<T extends IBase>(payload: Partial<T>) {
  payload.isActive = true;
  return payload;
}

export function transformDataOutput<T extends IBase>(data: Partial<T>) {
  data.isActive = true;
  return data;
}
