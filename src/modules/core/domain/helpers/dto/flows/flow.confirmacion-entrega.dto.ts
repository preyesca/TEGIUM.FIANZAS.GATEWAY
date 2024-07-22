import { Types } from 'mongoose';

export class FlowConfirmacionEntregaDto {
  folio: Types.ObjectId;
  entregado: boolean;
  archivos: Array<FlowConfirmacionEntregaArchivoDto>;
}

export class FlowConfirmacionEntregaArchivoDto {
  expediente: Types.ObjectId;
  correcto: boolean;
  motivo: number;
  usuarioAlta: Types.ObjectId;
  fechaHoraAlta: Date;
}
