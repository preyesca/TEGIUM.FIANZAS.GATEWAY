import { Types } from 'mongoose';
export class FlowFirmaEjecutivoDto {
  folio: Types.ObjectId;
  archivoFic?: Types.ObjectId | null;
  archivoAnexo?: Types.ObjectId | null;
  archivos: Array<FlowFirmaEjecutivoArchivosDto>;
}

export class FlowFirmaEjecutivoArchivosDto {
  documento: Types.ObjectId;
  correcto: boolean;
  motivo: number;
  usuarioAlta: Types.ObjectId;
  fechaHoraAlta: Date;
}
