import { Controller } from '@nestjs/common';
import { AdmProyectoConfiguracionRepository } from '../../persistence/repository/adm.proyecto-configuracion.repository';

@Controller()
export class AdmProyectoConfiguracionService {
  constructor(
    private readonly ProyectoConfiguracionService: AdmProyectoConfiguracionRepository,
  ) {}

  //RMQServices_Administracion.PROYECTO_CONFIGURACION.findProyectoConfiguracionByProyecto)
  async findOneByProyecto(payload: { proyecto: string; lang: string }) {
    return await this.ProyectoConfiguracionService.findOneByProyecto(
      payload.proyecto,
    );
  }
}
