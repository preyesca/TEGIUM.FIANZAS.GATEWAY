import { Types } from 'mongoose';

export class AdmConfiguracionDocumentalDto {
  pais: Number;
  aseguradora: Types.ObjectId;
  proyecto: Types.ObjectId;
  tipoPersona: Number;
  giro: Number;
  estatus: Number;
  documento: Array<AdmConfiguracionDocumentalDetalleDto>;
}

export class AdmConfiguracionDocumentalDetalleDto {
  documento: Types.ObjectId;
  activo: boolean;
  obligatorio: boolean;
  ocr: boolean;
  vigencia: boolean;
  motivosRechazo: number[];
}

export class AdmConfiguracionDocumentalResponseDto {
  pais: Number;
  aseguradora: Types.ObjectId;
  proyecto: Types.ObjectId;
  tipoPersona: Number;
  giro: Number;
  estatus: Number;
  documento: Array<AdmConfiguracionDocumentalDetalleResponseDto>;
}

export class AdmConfiguracionDocumentalDetalleResponseDto {
  documento: Types.ObjectId;
  nombre: string;
  clave: string;
  activo: boolean;
  obligatorio: boolean;
  ocr: boolean;
  vigencia: boolean;
  motivosRechazo: number[];
}
