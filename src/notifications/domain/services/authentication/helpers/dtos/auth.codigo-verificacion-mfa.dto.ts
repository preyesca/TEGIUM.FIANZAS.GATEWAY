import { NotifyMailOptionsDto } from "src/notifications/domain/helpers/dto/notify.mail-options.dto";

export class NotifyAuthCodigoVerificacionMfaDto extends NotifyMailOptionsDto {
  nombreUsuario: string;
  codigo: number;
  correoElectronico: string;
}
