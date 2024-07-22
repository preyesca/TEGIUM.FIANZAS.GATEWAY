import { Model } from 'mongoose';

export interface ModelExt<T> extends Model<T> {
  paginate: Function;
  aggregatePaginate: Function;
}
