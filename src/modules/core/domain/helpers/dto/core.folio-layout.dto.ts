import { Types } from 'mongoose';
import { ECatalogo } from 'src/app/common/enum/catalogo.enum';
import { ELayoutColumnType } from '../enum/core.layout-column-type.enum';

export class CoreFolioLayoutCreateHeaderBodyDto {
  filename: string;
  originalFilename: string;
  contentType: string;
  archivoSize: number;
  totalRows: number;
  fechaInicioCarga: Date;
}

export class CoreFolioLayoutUpdateHeaderBodyDto {
  _id: string;
  correcto: boolean;
  fechaInicioCarga: number;
}

export class CoreFolioLayoutDetailBodyDto {
  header: string;
  block: number;
  rowIndex: number;
  columns: CoreFolioLayoutDetailBodyColumnDto[];
  data: any[];
}

export class CoreFolioLayoutDetailBodyColumnDto {
  order: number;
  name: string;
  type: ELayoutColumnType;
  separator?: string;
  format?: string;
  catalog?: ECatalogo;
  required?: boolean;
}

export class CoreFolioLayoutCreateHeaderDto {
  filename: string;
  originalFilename: string;
  contentType: string;
  usuario: Types.ObjectId;
  archivoSize: number;
  totalRows: number;
  fechaInicioCarga: Date;
}

export class CoreFolioLayoutUpdateHeaderDto {
  _id: string;
  correcto: boolean;
}

export class CoreFolioLayoutDetailColumnDto {
  columnIndex: number;
  columnName: string;
  type: ELayoutColumnType;
  value: string;
  success: boolean;
  message?: string;
}

export class CoreFolioLayoutDetailRowDto {
  header: Types.ObjectId;
  block: number;
  rowIndex: number;
  success: boolean;
  message: string;
  columns: CoreFolioLayoutDetailColumnDto[];
}

/* Catalogo */

export enum ELayoutCatalogoTypeDto {
  NONE,
  UNIDAD,
  RIESGO,
  TIPO_CONTACTO,
  ASEGURADORA,
  TIPO_MOVIMIENTO,
  TIPO_PERSONA,
  GIRO,
  OFICINA,
}

export interface ILayoutCatalogoResponseDto {
  type: ELayoutCatalogoTypeDto;
  message: string | null;
  _id?: string;
  clave?: number;
}
