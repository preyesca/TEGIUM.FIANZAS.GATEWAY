import { Types } from 'mongoose';

export class FlowSolicitudTelefonoDTO {
  telefono: string;
  extensiones?: string[];
}

export class FlowSolicitudDTO {
  folio: Types.ObjectId;
  nombreAsegurado?: string;
  tipoPersona?: Types.ObjectId;
  nombreEjecutivo?: string;
  claveEjecutivo?: string;
  fechaVigencia?: Date;
  tipoMovimiento?: Types.ObjectId;
  numeroUnidad?: string;
  aseguradora?: Types.ObjectId;
  nombreContacto?: string;
  correos?: Array<string>;
  tipoContacto?: number;
  telefonosContacto?: Array<FlowSolicitudTelefonoDTO>;
}

export class NewFlowSolicitudDTO {
  folio: Types.ObjectId;
  informacionEjecutivo?: Types.ObjectId;
  informacionContacto?: Types.ObjectId;
  telefonosContacto?: Array<Types.ObjectId>;
  numeroUnidad?: string;
  fechaVigencia?: Date;
  aseguradora?: Types.ObjectId;
}
