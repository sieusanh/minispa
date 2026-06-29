export interface IBase {
  id?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export type GenericRecord<T extends IBase> = Record<keyof T, T[keyof T]>;

export interface FindParams {
  select?: string;
  where?: Record<string, unknown>;
  limit?: number;
}
