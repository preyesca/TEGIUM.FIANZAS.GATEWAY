import { Types } from 'mongoose';

export class ExpArchivoDto {
  aseguradora?: Types.ObjectId;
  titular: Types.ObjectId;
  documento: Types.ObjectId;
  nombreOriginal: string;
  nombreCorto: string;
  version: number;
  url: string;
  usuarioAlta: Types.ObjectId;
  fechaHoraAlta: Date;
  fechaHoraVigencia: Date;
  eliminado: boolean;
  usuarioElimina: Types.ObjectId;
  fechaHoraElimina: Date;
  archivo: string;
  mimetype: string;
  archivoSize: number;
  clave: string;
}
