import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { CoreFolio } from 'src/modules/core/persistence/database/core.folio.schema';

export type BitActividadDocument = HydratedDocument<BitActividad>;

@Schema({
  collection: SchemaPrefix.setBITACORA('actividades'),
  timestamps: false,
  versionKey: false,
})
export class BitActividad {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreFolio.name })
  folio: Types.ObjectId;

  @Prop({ required: true })
  actividad: number;

  @Prop({})
  usuario?: Types.ObjectId;

  @Prop({ required: true })
  estatusBitacora: string;

  @Prop({ required: true, default: Date.now })
  fecha: Date;

  @Prop({ required: false })
  comentario: string;
}

export const BitActividadSchema = SchemaFactory.createForClass(BitActividad);
