import { Types } from 'mongoose';

export class FlowFirmaClienteDto {
  folio: Types.ObjectId;
  archivoFic?: Types.ObjectId | null;
  archivoAnexo?: Types.ObjectId | null;
  archivos: Array<FlowFirmaClienteArchivosDto>;
}

export class FlowFirmaClienteArchivosDto {
  documento: Types.ObjectId;
  expediente: Types.ObjectId;
  correcto: boolean;
  motivo: number;
}
