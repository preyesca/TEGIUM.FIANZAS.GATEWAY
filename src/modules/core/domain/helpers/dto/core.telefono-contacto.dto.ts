import { Types } from 'mongoose';

export class CoreTelefonoContactoDto {
  folio: Types.ObjectId;
  telefono: string;
  extensiones: string[];
}


