import { Types } from 'mongoose';
import { ENotificacion } from 'src/app/common/enum/notificaciones.enum';

export class WorkflowDto {
  folio: Types.ObjectId;
  actividadInicial?: number;
  actividadFinal?: number;
  reproceso?: boolean;
  actividad?: string;
  notificacion?: number;
  comentarios?: string;
}
