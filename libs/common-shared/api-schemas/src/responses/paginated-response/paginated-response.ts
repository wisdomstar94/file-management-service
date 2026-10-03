export type PaginatedResponse<TItem> = {
  items: TItem[];
  total: number;
  page: number;
  size: number;
};
