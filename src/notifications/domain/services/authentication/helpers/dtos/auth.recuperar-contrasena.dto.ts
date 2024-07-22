import { NotifyMailOptionsDto } from "src/notifications/domain/helpers/dto/notify.mail-options.dto";

export class NotifyAuthRecuperarContrasenaDto extends NotifyMailOptionsDto {
  nombreUsuario: string;
  password: string;
  correoElectronico: string;
}
