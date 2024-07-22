import { Controller } from '@nestjs/common';
import { AdmProyectoFolioRepository } from '../../persistence/repository/adm.proyecto-folio.repository';

@Controller()
export class AdmProyectoFolioService {
  constructor(
    private readonly proyectoFolioService: AdmProyectoFolioRepository,
  ) {}

  //'FIND_ONE_PROYECTO_FOLIO_BY_PROYECTO')
  async findOneByProyecto(payload: { proyecto: string; lang: string }) {
    return await this.proyectoFolioService.findOneByProyecto(payload.proyecto);
  }
}
