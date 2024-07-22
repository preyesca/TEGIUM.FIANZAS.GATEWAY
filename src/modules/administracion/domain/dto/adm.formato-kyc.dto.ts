import { Types } from 'mongoose';

export class AdmFormatoKycDto {
  proyecto: Types.ObjectId;
  tipoPersona: Array<number>;
  pais: number;
  documento: Types.ObjectId;
  aseguradora: Types.ObjectId;
  nombre: string;
  path: string;
}
