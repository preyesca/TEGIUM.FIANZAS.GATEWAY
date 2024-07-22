import { Types } from 'mongoose';

export class AdmUsuarioProyectoDto {
  proyecto: Types.ObjectId;
  pais: number;
  perfiles: number[];
}
