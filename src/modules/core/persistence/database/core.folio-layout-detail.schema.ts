import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { CoreFolioLayout } from './core.folio-layout.schema';

export type CoreFolioLayoutDetailDocument =
  HydratedDocument<CoreFolioLayoutDetail>;

class ColumnLayout {
  columnIndex: number;
  columnName: string;
  type: number;
  value: string;
  success: boolean;
  message?: string;
}

@Schema({
  collection: SchemaPrefix.setCORE('folio-layout-details'),
  timestamps: false,
  versionKey: false,
})
export class CoreFolioLayoutDetail {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreFolioLayout.name })
  header: Types.ObjectId;

  @Prop({ required: true })
  block: number;

  @Prop({ required: true })
  rowIndex: number;

  @Prop({ required: true })
  success: boolean;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  columns: [ColumnLayout];
}

export const CoreFolioLayoutDetailSchema = SchemaFactory.createForClass(
  CoreFolioLayoutDetail,
);
