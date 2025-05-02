import { Type } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

export interface PaginateOptions {
  limit: number;
  page: number;
  total?: boolean;
}

export function Paginated<T>(classRef: Type<T>) {
  class PaginationResult<T> {
    constructor(partial: Partial<PaginationResult<T>>) {
      Object.assign(this, partial);
    }
    @Expose()
    first: number;

    @Expose()
    last: number;

    @Expose()
    limit: number;

    @Expose()
    total?: number;

    @Expose()
    data: T[];
  }

  return PaginationResult<T>;
}

export async function paginate<T, K>(
  qb: SelectQueryBuilder<T>,
  classRef: Type<K>,
  options: PaginateOptions & { additionalFields?: string[] } = {
    limit: 15,
    page: 1,
  },
): Promise<K> {
  const offset = (options.page - 1) * options.limit;
  const { raw, entities } = await qb.skip(offset).take(options.limit).getRawAndEntities();

  if (options.additionalFields?.length) {
    entities.forEach((entity, index) => {
      const rawItem = raw[index];
      for (const field of options.additionalFields!) {
        if (field in rawItem) {
          (entity as any)[field] = rawItem[field];
        }
      }
    });
  }

  const total = options.total ? await qb.getCount() : null;

  return new classRef({
    first: offset + 1,
    last: offset + entities.length,
    limit: options.limit,
    total,
    data: entities,
  });
}
