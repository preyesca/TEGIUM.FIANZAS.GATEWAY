import { Types } from 'mongoose';

export class AdmPermisoDto {
  descripcion: string;
  permiso: string;
}

export class AdmPermisoPerfilDto {
  proyecto: Types.ObjectId;
  perfil: number;
  permisos: Array<AdmPermisoDto>;
}
