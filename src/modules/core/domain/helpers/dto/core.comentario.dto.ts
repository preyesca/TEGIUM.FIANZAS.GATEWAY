import mongoose, { Types } from 'mongoose';

export class CoreComentarioDto {
  folio: mongoose.Types.ObjectId;
  bitacora?: Types.ObjectId;
  comentarios?: string;
  actividad: number;
}

export class CoreComentarioActividadDto {
  folio: mongoose.Types.ObjectId;
  actividades: CoreActividadesDetalleDto[];
}

export class CoreActividadesDetalleDto {
  _id?:mongoose.Types.ObjectId;
  bitacora?: Types.ObjectId;
  comentarios: string;
  actividad: number;
  fecha: Date;
}

