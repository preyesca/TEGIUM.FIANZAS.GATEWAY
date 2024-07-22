import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FlowFolioRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  folio: Types.ObjectId;

  @ApiProperty()
  folioCliente: string;

  @ApiProperty()
  autorizado: boolean;
}
export class CreateFolioAutorizadoRequestDto {
  @ApiProperty({ type: FlowFolioRequestDto, isArray: true })
  folios: Array<FlowFolioRequestDto>;
}
