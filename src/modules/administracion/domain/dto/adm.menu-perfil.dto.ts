import { Types } from 'mongoose';

export class AdmSubMenuDto {
  descripcion: string;
  path: string;
  orden: number;
}

export class AdmMenuDto {
  descripcion: string;
  icono: string;
  path: string;
  submenus: Array<AdmSubMenuDto>;
  orden: number;
}

export class AdmModuloDto {
  descripcion: string;
  menus: Array<AdmMenuDto>;
  orden: number;
}

export class AdmMenuPerfilDto {
  proyecto: Types.ObjectId;
  perfil: number;
  pathInicial: string;
  modulos: Array<AdmModuloDto>;
}
