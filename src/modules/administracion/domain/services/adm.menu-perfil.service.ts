import { Controller } from '@nestjs/common';
import { CatPerfilRepository } from 'src/modules/catalogo/persistence/repository/cat.perfil.repository';
import { AdmMenuPerfil } from '../../persistence/database/adm.menu-perfil.schema';
import { AdmMenuPerfilRepository } from '../../persistence/repository/adm.menu-perfil.repository';

@Controller()
export class AdmMenuPerfilService {
  constructor(
    private readonly catPerfilRepository: CatPerfilRepository,
    private readonly admMenuPerfilRepository: AdmMenuPerfilRepository,
  ) {}

  //FIXME: RMQServices_Administracion.MENU_PERFIL.fidByPerfil
  async findByPerfil(payload: {
    proyecto: string;
    rol: string;
    lang: string;
  }): Promise<AdmMenuPerfil> {
    const perfil = await this.catPerfilRepository.findOne(payload.rol);
    return await this.admMenuPerfilRepository.findByPerfil(
      payload.proyecto,
      perfil.clave,
    );
  }
}
