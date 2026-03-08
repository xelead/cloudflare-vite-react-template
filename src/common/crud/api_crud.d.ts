
export interface ApiCrud<T> {
  count: () => Promise<number>
  create: (data: Record<string, any>) => Promise<T | null>
  delete: (where: Record<string, any>) => Promise<T | null>
  deleteMany: (where: Record<string, any>) => Promise<T[]>
  find: (where: Record<string, any>) => Promise<T | null>
  findMany: (where: Record<string, any>) => Promise<T[]>
}
export interface IPagingQuery<FilterFieldNamesT> {
  filterExpr?: any
  pageNumber?: number
  pageSize?: number
  sort?: IEntitySortColumn<FilterFieldNamesT>[]
}

