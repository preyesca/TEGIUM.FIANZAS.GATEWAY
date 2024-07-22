import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { AdmMenuPerfilService } from 'src/modules/administracion/domain/services/adm.menu-perfil.service';

@Controller(`${SwaggerConsts.ADMINISTRATION.controller}/menu-perfil`)
@ApiTags(SwaggerConsts.ADMINISTRATION.children.MENU_PERFIL)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class AdmMenuPerfilController {
  constructor(private readonly admMenuPerfilService: AdmMenuPerfilService) {}

  @Get('find-menu-by-perfil')
  async find_by_perfil(@Request() req: any, @I18n() i18n: I18nContext) {
    const data = await this.admMenuPerfilService.findByPerfil({
      proyecto: req.user.proyecto,
      rol: req.user.rol,
      lang: i18n.lang,
    });

    return { data };
  }
}
