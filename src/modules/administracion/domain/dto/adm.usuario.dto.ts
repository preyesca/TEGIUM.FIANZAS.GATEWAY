import { AdmUsuarioProyectoDto } from './adm.usuario-proyecto.dto';

export class AdmUsuarioDto {
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  correoElectronico: string;
  proyectos: Array<AdmUsuarioProyectoDto>;
  estatus: number;
}
