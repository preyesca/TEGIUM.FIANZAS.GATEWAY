export class AuthSesionMfaDto {
  usuarioId: string;
  correo: string;
  codigo: number;
  estatus: number;
  nombreUsuario?: string;
}
