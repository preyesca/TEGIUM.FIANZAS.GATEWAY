import { Types } from 'mongoose';

export class FlowValidacionFirmaDto {
  folio: Types.ObjectId;
  archivos: Array<FlowValidacionFirmaArchivoDto>;
}

export class FlowValidacionFirmaArchivoDto {
  documento: Types.ObjectId;
  expediente: Types.ObjectId;
  correcto: boolean;
  motivo: number;
}
