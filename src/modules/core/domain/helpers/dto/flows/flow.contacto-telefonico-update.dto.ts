import { Types } from 'mongoose';

export class FlowContactoTelefonicoUpdateDto {
  tipoLlamada: Types.ObjectId;
  estatus: Types.ObjectId;
  observaciones: string;
  fechaProximaLlamada: Date;
}
