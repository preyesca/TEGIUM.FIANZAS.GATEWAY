import { Types } from 'mongoose';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
export class BitActividadDto {
  folio: Types.ObjectId;
  actividad: number;
  usuario: Types.ObjectId;
  estatusBitacora: string;
  fecha?: Date;
  comentario?: string;
}
export class BitOutDetailsDto{
  _id: Types.ObjectId;
  folio: Types.ObjectId;
  usuario: Types.ObjectId;
  estatusBitacora: string;
  fecha: Date;
  comentario?: string;
}
export class SelectFolioDetailsDto {
  data: Types.ObjectId;
  lang: string;
  paginate: IPaginateParams;
}

export class OrdenandoComentarioDto {
  bitacora:    Types.ObjectId | null;
  comentarios: string;
  actividad:   number;
  fecha:       Date;
}