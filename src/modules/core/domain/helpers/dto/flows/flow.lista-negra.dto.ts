import { Types } from "mongoose";

export class FlowFoliosAutorizadosDto {
    usuario?: Types.ObjectId;
    folios: Array<FlowFolios>;
}

export class FlowFolios {
    folio: Types.ObjectId;
    folioCliente: string;
    autorizado: boolean;
    fecha?: Date
}

export class FlowCreateFoliosAutorizadosDto {
    folio: Types.ObjectId;
    folioCliente: string;
    historial: Array<FlowHistorialDto>;
}

export class FlowHistorialDto {
    usuario: Types.ObjectId;
    autorizado: boolean;
    fecha: Date
}



