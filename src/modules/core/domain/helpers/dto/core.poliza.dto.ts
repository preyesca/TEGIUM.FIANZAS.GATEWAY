import { Types } from 'mongoose';

export class CorePolizaCreateDto {
  folio: string;
  aseguradora: string;
  riesgo: number;
  unidad: number;
  fechaVigencia: Date;
}

export class CorePolizaDto {
  folio: Types.ObjectId;
  aseguradora: Types.ObjectId;
  riesgo: number;
  unidad: number;
  fechaVigencia: Date;
}
