import { Types } from 'mongoose';

export class FlowContactoTelefonicoDto {
  tipoLlamada: number;
  estatus: number;
  observaciones: string;
  usuario: Types.ObjectId;
  folio: Types.ObjectId;
  fechaProximaLlamada: Date;
}

export class FlowInformacionTelefonicaDto {
  id?: string;
  folio: Types.ObjectId;
  telefono: string;
  extensiones: string[];
}

export interface FlowInformacionContactoDto {
  folio: Types.ObjectId;
  nombre: string;
  tipo: number;
  correos: string[];
}
