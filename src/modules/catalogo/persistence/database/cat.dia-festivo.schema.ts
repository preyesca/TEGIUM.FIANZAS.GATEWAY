import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatDiaFestivoDocument = HydratedDocument<CatDiaFestivo>;

@Schema({
  collection: SchemaPrefix.setCAT('dia-festivo'),
  timestamps: false,
  versionKey: false,
})
export class CatDiaFestivo {
  _id: Types.ObjectId;

  @Prop({ type: Number, required: true})
  month: number;

  @Prop({ type: Number, required: true })
  day: number;

  @Prop({ type: Number, required: true })
  year: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Boolean, default: true })
  activo: boolean;
}

export const CatDiaFestivoSchema = SchemaFactory.createForClass(CatDiaFestivo);
