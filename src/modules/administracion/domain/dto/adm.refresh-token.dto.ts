
export class AdmRefreshTokenDto {
    usuario: string;
    proyecto: string;
    rol: string;
    fechaHoraCreacion: Date;
    fechaHoraExpiracion: Date;
}

/* Response */

export enum ERefreshTokenStatus {
    OK = 0,
    RF_NOT_EXISTS = 1,
    RF_EXPIRED = 2
}

export interface IRefreshTokenResponse {
    status: ERefreshTokenStatus;
    usuario?: string;
    proyecto?: string;
    rol?: string;
}