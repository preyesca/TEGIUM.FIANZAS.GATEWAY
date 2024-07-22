import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsMongoId, IsNotEmpty, IsOptional, Min, isBoolean } from "class-validator";
import mongoose from "mongoose";
import { i18nValidationMessage } from "nestjs-i18n";

export class BitActividadDto {

    @ApiProperty()
    @IsMongoId({ message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID') })
    folio: mongoose.Types.ObjectId;

    @ApiProperty()
    @Min(1, {
        message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
    })
    actividad: number;

    @ApiProperty()
    @IsMongoId({ message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID') })
    usuario: mongoose.Types.ObjectId;

    @ApiProperty()
    @IsNotEmpty({ message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO') })
    estatusBitacora: string;

    @ApiProperty()
    @IsOptional()
    comentario: string;

}