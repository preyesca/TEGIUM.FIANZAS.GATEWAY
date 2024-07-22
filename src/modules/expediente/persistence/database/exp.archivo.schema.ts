import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type ExpArchivoDocument = HydratedDocument<ExpArchivo>;

class cotejado {
  usuario: Types.ObjectId;
  path: string;
  fechaCreacion: Date;
}

class enviado {
  usuario: Types.ObjectId;
  fechaSeleccion: Date;
}

@Schema({
  collection: SchemaPrefix.setEXPEDIENTE('archivos'),
  timestamps: false,
  versionKey: false,
})
export class ExpArchivo {
  _id: Types.ObjectId;

  @Prop({})
  aseguradora?: Types.ObjectId;

  @Prop({ required: true })
  titular: Types.ObjectId;

  @Prop({ required: true })
  documento: Types.ObjectId;

  @Prop({ required: true })
  nombreOriginal: string;

  @Prop({ required: true })
  nombreCorto: string;

  @Prop({ required: true })
  version: number;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  usuarioAlta: Types.ObjectId;

  @Prop({ default: Date.now, required: true })
  fechaHoraAlta: Date;

  @Prop({})
  fechaHoraVigencia?: Date;

  @Prop({ required: false, default: null })
  cotejado: cotejado;

  @Prop({ required: false, default: null })
  enviado: enviado;

  @Prop({ required: true, default: 0 })
  archivoSize: number;

  @Prop({ default: false })
  eliminado: boolean;

  @Prop({
    required: function () {
      return this.eliminado;
    },
  })
  usuarioElimina: Types.ObjectId;

  @Prop({
    required: function () {
      return this.eliminado;
    },
  })
  fechaHoraElimina: Date;
}

export const ExpArchivoSchema = SchemaFactory.createForClass(ExpArchivo);
