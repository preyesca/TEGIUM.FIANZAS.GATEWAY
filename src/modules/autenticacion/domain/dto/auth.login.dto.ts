export interface ILoginDto {
  correoElectronico: string;
  password: string;
}

export interface ILoginUserPerfilDto {
  clave: number;
  descripcion: string;
}

export interface ILoginProyectoDto {
  _id: string;
  pais: number;
  aseguradora: string;
  codigo: string;
}

export interface ILoginRolDto {
  _id: string;
  clave: number;
  descripcion: string;
  activo: true;
}

export interface ILoginUserPaisDto {
  clave: number;
  descripcion: string;
  abreviatura: string;
  icon: string;
}

export interface ILoginUserDto {
  _id: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  correoElectronico: string;
  // pais: ILoginUserPaisDto;
}

export interface ILoginResultDto {
  usuario: ILoginUserDto;
  proyectos: Array<ILoginProyectoDto>;
  // roles: Array<ILoginRolDto>;
}
