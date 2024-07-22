import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';
import { FlowConfirmacionEntregaArchivoRequestDto } from './flow.confirmacion-entrega-archivo.request.dto';

export class FlowConfirmacionEntregaRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  folio: Types.ObjectId;

  @ApiProperty()
  entregado: boolean;

  @ApiProperty()
  archivos: Array<FlowConfirmacionEntregaArchivoRequestDto>;
}
