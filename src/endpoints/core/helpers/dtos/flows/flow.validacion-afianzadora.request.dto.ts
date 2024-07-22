import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import mongoose from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';
import { FlowValidacionAfianzadoraArchivosDto } from './flow.validacion-afianzadora-archivos.request.dto';


export class FlowValidacionAfianzadoraDto{
  @ApiProperty()
  @IsMongoId({ message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID') })
  folio: mongoose.Types.ObjectId;

  @ApiProperty()
  archivos: Array<FlowValidacionAfianzadoraArchivosDto>;
}
