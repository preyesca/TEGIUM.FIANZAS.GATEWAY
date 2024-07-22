import { Types } from 'mongoose';

export class AdmProyectoDto {
  pais: number;
  aseguradora: Types.ObjectId;
  ramo: number;
  proceso: number;
  negocio: number;
  ceco: string;
  estatus: number;
  codigo: string;
  portal: string;
  nombreCliente?: string;
  nombreComercial?: string;
}
