import { Types } from 'mongoose';

export class CoreInformacionEjecutivoDto {
  proyecto: Types.ObjectId;
  numero?: string;
  nombre?: string;
}
