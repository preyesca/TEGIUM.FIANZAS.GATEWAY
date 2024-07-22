import mongoose, { Types } from "mongoose";

export class AdmConfiguracionAseguradoraDto {
    aseguradora: Types.ObjectId;
    proyecto: Types.ObjectId;
    pais: number;
    oficinas: Array<OficinaCorreoDto>
}

export class OficinaCorreoDto {
    oficina?: number;
    correos: Array<string>;
}
