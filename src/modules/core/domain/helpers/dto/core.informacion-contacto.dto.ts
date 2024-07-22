import { Types } from 'mongoose';

export class CoreInformacionContactoDto {
  folio: Types.ObjectId;
  nombre?: string;
  tipo?: number;
  correos?: string[];
}

export class CoreLoginAseguradoBodyDto {
  numeroCliente: string;
  correoElectronico: string;
}
