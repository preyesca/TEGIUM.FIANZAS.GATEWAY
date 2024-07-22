
import mongoose, { Types } from 'mongoose';

export class FlowValidacionAfianzadoraDto {
  folio: mongoose.Types.ObjectId;
  archivos: Array<FlowValidacionAfianzadoraArchivosDto>;
}

export class FlowValidacionAfianzadoraArchivosDto {
  documento: Types.ObjectId;
  expediente: Types.ObjectId;
  correcto: boolean;
  motivo: number;
}