import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { AdmPermisoPerfilService } from 'src/modules/administracion/domain/services/adm.permiso-perfil.service';

@Controller('administracion/permiso-perfil')
@ApiTags('PermisoPerfil')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class AdmPermisoPerfilController {
  constructor(
    private readonly admPermisoPerfilService: AdmPermisoPerfilService,
  ) {}

  @Get('find-permiso-by-perfil/:permiso')
  async find_by_perfil(
    @Request() req: any,
    @Param('permiso') permiso: string,
    @I18n() i18n: I18nContext,
  ) {
    const data = await this.admPermisoPerfilService.findAllByPerfil(
      {
        proyecto: req.user.proyecto,
        rol: req.user.rol,
      },
      i18n,
    );

    const exist = data.permisos.find((x) => x.permiso == permiso);
    if (exist) return { success: true, data: null, message: '' };
    else
      return {
        success: false,
        data: null,
        message:
          'No tiene permisos al módulo que intenta ingresar, consulte al administrador',
      };
  }
}
