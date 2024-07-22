import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { AuthSesionUsuarioService } from 'src/modules/autenticacion/domain/services/auth.sesion-usuario.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const AllowAnonymous = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller(`${SwaggerConsts.AUTHENTICATION.controller}/sesiones`)
@ApiTags(SwaggerConsts.AUTHENTICATION.tag)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class AuthSesionUsuarioController {
  constructor(
    private readonly authSesionUsuarioService: AuthSesionUsuarioService,
  ) {}

  @Post('singOff-by-usuario')
  async signOff(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.authSesionUsuarioService.signOff({
      usuario: req.user.usuario,
      lang: i18n.lang,
    });
  }

  @Post('logout-admin')
  async logoutAdmin(
    @Body() data: { usuario: string },
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.authSesionUsuarioService.signOff({
      usuario: data.usuario,
      lang: i18n.lang,
    });
  }

  @Get('time-logout')
  async timeLogout() {
    return { data: process.env.MSH_APP_TIMELOGOUT || '15' };
  }
}
