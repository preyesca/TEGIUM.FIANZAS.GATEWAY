import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AvanzarWorkflowRequestDto {
    @ApiProperty()
    @IsMongoId({ message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID') })
    folio: Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty({ message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO') })
    actividadInicial: number;

    @ApiProperty()
    @IsNotEmpty({ message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO') })
    actividadFinal: number;
}
