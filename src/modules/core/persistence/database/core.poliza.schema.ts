import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmAseguradora } from 'src/modules/administracion/persistence/database/adm.aseguradora.schema';
import { CoreFolio } from './core.folio.schema';

export type CorePolizaDocument = HydratedDocument<CorePoliza>;

@Schema({
  collection: SchemaPrefix.setCORE('polizas'),
  timestamps: false,
  versionKey: false,
})
export class CorePoliza {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreFolio.name })
  folio: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmAseguradora.name })
  aseguradora: Types.ObjectId;

  @Prop({ required: true })
  riesgo: number;

  @Prop({ required: true })
  unidad: number;

  @Prop({ required: true })
  fechaVigencia: Date;
}

export const CorePolizaSchema = SchemaFactory.createForClass(CorePoliza);
