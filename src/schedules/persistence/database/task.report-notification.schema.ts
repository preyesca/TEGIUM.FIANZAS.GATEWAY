import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type TaskReportNotificationDocument =
  HydratedDocument<TaskReportNotification>;

@Schema({
  collection: SchemaPrefix.setTASK('report-notification'),
  timestamps: false,
  versionKey: false,
})
export class TaskReportNotification {
  _id: Types.ObjectId;

  @Prop({ required: true, default: false })
  procesado: boolean;

  @Prop({ required: true, default: Date.now })
  fechaCreacion: Date;

  @Prop({ required: false })
  fechaEnvio: Date;

  @Prop({ type: [String], required: true })
  destinatarios: string[];

  @Prop({ type: Date, required: true })
  fechaInicio: Date;

  @Prop({ type: Date, required: true })
  fechaFin: Date;

  @Prop({ type: Number, required: true })
  tipoReporte: number;
}

export const TaskReportNotificationSchema = SchemaFactory.createForClass(
  TaskReportNotification,
);
