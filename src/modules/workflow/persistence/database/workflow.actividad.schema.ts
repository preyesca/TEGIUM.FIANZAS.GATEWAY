import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from 'src/modules/administracion/persistence/database/adm.proyecto.schema';

export type WorkflowActividadDocument = HydratedDocument<WorkflowActividad>;

@Schema({
  collection: SchemaPrefix.setWORKFLOW('actividades'),
  timestamps: false,
  versionKey: false,
})
export class WorkflowActividad {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyecto: Types.ObjectId;

  @Prop({ required: true })
  folioMultisistema: number;

  @Prop({ required: true })
  actividad: number;

  @Prop({ required: true })
  estatus: number;

  @Prop({ default: null })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  rol: number;

  @Prop({ default: Date.now })
  fechaAlta: Date;

  @Prop({ default: null })
  fechaInicial: Date;

  @Prop({ default: null })
  fechaFinal: Date;
}

export const WorkflowActividadSchema =
  SchemaFactory.createForClass(WorkflowActividad);
