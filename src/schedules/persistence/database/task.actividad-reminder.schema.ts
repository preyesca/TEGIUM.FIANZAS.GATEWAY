import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { CoreFolio } from 'src/modules/core/persistence/database/core.folio.schema';
export type TaskActividadReminderDocument = HydratedDocument<TaskActividadReminder>;

@Schema({
  collection: SchemaPrefix.setTASK('actividad-reminder'),
  timestamps: false,
  versionKey: false,
})
export class TaskActividadReminder {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreFolio.name })
  folio: Types.ObjectId;

  @Prop({ required: true })
  actividad: number;

  @Prop({ required: true, default: Date.now })
  fechaEnvio: Date;

}

export const TaskActividadReminderSchema =
  SchemaFactory.createForClass(TaskActividadReminder);
