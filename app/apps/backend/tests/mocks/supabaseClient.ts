type QueryResult<T = any> = {
  data?: T;
  error?: { message: string; code?: string } | null;
  count?: number | null;
};

type QueryBuilder<T = any> = {
  select: (...args: any[]) => QueryBuilder<T>;
  order: (...args: any[]) => QueryBuilder<T>;
  range: (...args: any[]) => QueryBuilder<T>;
  eq: (...args: any[]) => QueryBuilder<T>;
  neq: (...args: any[]) => QueryBuilder<T>;
  ilike: (...args: any[]) => QueryBuilder<T>;
  insert: (...args: any[]) => QueryBuilder<T>;
  update: (...args: any[]) => QueryBuilder<T>;
  delete: (...args: any[]) => QueryBuilder<T>;
  gte: (...args: any[]) => QueryBuilder<T>;
  lte: (...args: any[]) => QueryBuilder<T>;
  single: () => Promise<QueryResult<T>>;
  maybeSingle: () => Promise<QueryResult<T>>;
  then: (resolve: (value: QueryResult<T>) => void) => Promise<void>;
};

export function createQueryBuilder<T = any>(
  result: QueryResult<T>,
  overrides: Partial<QueryBuilder<T>> = {}
): QueryBuilder<T> {
  const builder: any = {
    select: jest.fn(() => builder),
    order: jest.fn(() => builder),
    range: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    neq: jest.fn(() => builder),
    ilike: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    single: jest.fn(() => Promise.resolve(result)),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    then: jest.fn((resolve: (value: QueryResult<T>) => void) => Promise.resolve(resolve(result))),
  };

  return Object.assign(builder, overrides);
}

export function createSupabaseClientStub() {
  const tableQueues = new Map<string, any[]>();

  const client: any = {
    from: jest.fn((table: string) => {
      const queue = tableQueues.get(table);
      if (!queue || queue.length === 0) {
        throw new Error(`No mock query builder queued for table "${table}"`);
      }
      return queue.shift();
    }),
    __queue(table: string, builder: any) {
      const queue = tableQueues.get(table) ?? [];
      queue.push(builder);
      tableQueues.set(table, queue);
    },
    __reset() {
      tableQueues.clear();
      client.from.mockClear();
    },
  };

  return client;
}



