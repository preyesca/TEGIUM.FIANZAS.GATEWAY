import { ERefreshTokenStatus } from 'src/app/common/enum/auth/refresh-token-status.enum';

export class AuthRefreshTokenDto {
  usuario: string;
  proyecto: string;
  rol: string;
  fechaHoraCreacion: Date;
  fechaHoraExpiracion: Date;
}

export interface IRefreshTokenResponse {
  status: ERefreshTokenStatus;
  usuario?: string;
  proyecto?: string;
  rol?: string;
}
