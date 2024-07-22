import { Types } from 'mongoose';

export class CoreTitularDto {
  proyecto: Types.ObjectId;
  numeroCliente: string;
  nombre: string;
  primerApellido?: string;
  segundoApellido?: string;
  tipoPersona: number;
}
