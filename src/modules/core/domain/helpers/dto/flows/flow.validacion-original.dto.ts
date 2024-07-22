import { Types } from 'mongoose';

export class FlowValidacionOriginalesCreateDto {
  folio: Types.ObjectId;
  archivos: Array<FlowValidacionOriginalesArchivoDto>;
}

export class FlowValidacionOriginalesArchivoDto {
  documento: Types.ObjectId;
  expediente: Types.ObjectId;
  correcto: boolean;
  motivo: number;
}


