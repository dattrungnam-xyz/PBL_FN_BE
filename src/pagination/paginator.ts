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
  options: PaginateOptions = {
    limit: 15,
    page: 1,
  },
): Promise<K> {
  const offset = (options.page - 1) * options.limit;
  const data = await qb.skip(offset).take(options.limit).getMany();
  return new classRef({
    first: offset + 1,
    last: offset + data.length,
    limit: options.limit,
    total: options.total ? await qb.getCount() : null,
    data,
  });
}
