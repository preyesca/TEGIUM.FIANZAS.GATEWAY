export interface IPaginateParams {
  limit: number;
  page: number;
  search: string;
  order: string | null;
  sort: string | null;
}
