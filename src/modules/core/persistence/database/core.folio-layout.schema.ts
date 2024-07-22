import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmUsuario } from 'src/modules/administracion/persistence/database/adm.usuario.schema';

export type CoreFolioLayoutDocument = HydratedDocument<CoreFolioLayout>;

@Schema({
  collection: SchemaPrefix.setCORE('folio-layouts'),
  timestamps: false,
  versionKey: false,
})
export class CoreFolioLayout {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmUsuario.name })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: false })
  totalRows: number;

  @Prop({ required: false })
  correcto: boolean;

  @Prop({ required: true })
  archivoSize: number;

  @Prop({ required: true })
  fechaInicioCarga: Date;

  @Prop({ required: false })
  fechaFinCarga: Date;

  @Prop({ default: false })
  procesado: boolean;
}

export const CoreFolioLayoutSchema =
  SchemaFactory.createForClass(CoreFolioLayout);
