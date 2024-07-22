import { NotifyMailOptionsDto } from "src/notifications/domain/helpers/dto/notify.mail-options.dto";

export class NotifyAuthActivarCuentaDto extends NotifyMailOptionsDto {
  _id: string;
  nombreUsuario: string;
  correoElectronico: string;
}
