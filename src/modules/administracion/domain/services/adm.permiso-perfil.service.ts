import { Controller } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { CatPerfilService } from 'src/modules/catalogo/domain/services/cat.perfil.service';
import { AdmPermisoPerfil } from '../../persistence/database/adm.permiso-perfil.schema';
import { AdmPermisoPerfilRepository } from '../../persistence/repository/adm.permiso-perfil.repository';

@Controller()
export class AdmPermisoPerfilService {
  constructor(
    private readonly admPermisoPerfilRepository: AdmPermisoPerfilRepository,
    private readonly catPerfilService: CatPerfilService,
  ) {}

  //FIXME: RMQServices_Administracion.PERMISO_PERFIL.fidByPerfil
  async findAllByPerfil(
    payload: { proyecto: string; rol: string },
    @I18n() i18n: I18nContext,
  ): Promise<AdmPermisoPerfil> {
    const perfil = await this.catPerfilService.findOne(payload.rol, i18n);

    const permiso = await this.admPermisoPerfilRepository.findByPerfil(
      payload.proyecto,
      perfil.data.clave,
    );

    return permiso;
  }
}
