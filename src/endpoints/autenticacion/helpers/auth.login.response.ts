export interface IRolLoginResponse {
  _id: string;
  clave: number;
  descripcion: string;
}

export interface IProyectoLoginResponse {
  _id: string;
  pais: number;
  aseguradora: string;
  codigo: string;
  roles: any[];
}

export interface IPaisLoginResponse {
  clave: number;
  descripcion: string;
  abreviatura: string;
  icon: string;
}

export interface IUsuarioLoginResponse {
  _id: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  correoElectronico: string;
  pais: IPaisLoginResponse;
}

export interface ILoginAuthResponse {
  usuario: IUsuarioLoginResponse;
  proyectos: IProyectoLoginResponse[];
}

export interface ILoginResponseDto<T> {
  path: string;
  needToChoose: boolean;
  data: T;
}

export interface ILoginSingleResponse {
  token: string;
  refreshToken: string;
  usuario: IUsuarioSingle;
  proyectos: any[];
}

export interface IUsuarioSingle {
  _id: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  correoElectronico: string;
  pais: IPaisLoginResponse;
  rol: IRolLoginResponse;
  proyecto: IProyectoLoginResponse;
  modulo: IPermisoModulo;
}

export interface IPermisoModulo {
  initialPath: string;
  paths: Array<string>;
  navs: Array<ICategoriaMenu>;
}

export interface IPermisoRolModulo {
  rutaInicial: string;
  modulos: Array<string>;
  categorias: Array<ICategoriaMenu>;
}

export interface ICategoriaMenu {
  orden: number;
  descripcion: string;
  menus: Array<IMenu>;
}

export interface IMenu {
  orden: number;
  descripcion: string;
  icono: string;
  path?: string;
  submenus: Array<ISubMenu>;
}

export interface ISubMenu {
  orden: number;
  descripcion: string;
  icono: string;
  path: string;
}
