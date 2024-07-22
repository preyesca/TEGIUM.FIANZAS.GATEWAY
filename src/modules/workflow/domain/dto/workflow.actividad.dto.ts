import { Types } from 'mongoose';

export class WorkflowActividadDto {
  _id?: Types.ObjectId;
  proyecto: Types.ObjectId;
  folioMultisistema: number;
  actividad: number;
  estatus: number;
  usuario: Types.ObjectId;
  rol: number;
  fechaAlta: Date;
  fechaInicial: Date;
  fechaFinal: Date;
  reproceso?: string;
}


export interface IFnzWorklFlow {
  folio: string;
  actividadInicial: number;
  actividadFinal: number;
  actividad:string;
  notificacion?:number,
  documentos?:string[]
}