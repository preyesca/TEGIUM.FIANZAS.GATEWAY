import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class IniciarWorkflowRequestDto {
    @ApiProperty()
    @IsMongoId({ message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID') })
    folio: Types.ObjectId;
}
