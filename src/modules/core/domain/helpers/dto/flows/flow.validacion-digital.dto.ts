import mongoose, { Types } from 'mongoose';

export class FlowValidacionDigitalDto {
  folio: Types.ObjectId;
  archivos: Array<FlowValidacionDigitalArchivoDto>;
}

export class FlowValidacionDigitalArchivoDto {
  documento: Types.ObjectId;
  expediente: Types.ObjectId;
  correcto: boolean;
  motivo: number;
  fechaVigencia?: Date
}
