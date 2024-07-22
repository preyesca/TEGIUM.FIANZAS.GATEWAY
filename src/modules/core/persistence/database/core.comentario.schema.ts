import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { CoreComentarioDetalle } from './core.comentario-detalle.schema';
import { CoreFolio } from './core.folio.schema';

export type CoreComentarioDocument = HydratedDocument<CoreComentario>;

@Schema({
  collection: SchemaPrefix.setCORE('comentarios'),
  timestamps: false,
  versionKey: false,
})
export class CoreComentario {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreFolio.name })
  folio: Types.ObjectId;

  @Prop({ required: true })
  actividades: Array<CoreComentarioDetalle>;
}

export const CoreComentarioSchema =
  SchemaFactory.createForClass(CoreComentario);
