import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { AuthSesionMfaService } from 'src/modules/autenticacion/domain/services/auth.sesion-mfa.service';
import { AuthTokenController } from './auth.token.controller';

@Controller(`${SwaggerConsts.AUTHENTICATION.controller}/sesiones-mfa`)
@ApiTags(SwaggerConsts.AUTHENTICATION.tag)
export class AuthSesionMfaController {
  constructor(
    @Inject(AuthTokenController)
    private readonly authTokenController: AuthTokenController,
    private readonly authSesionMfaService: AuthSesionMfaService,
  ) { }

  @Post()
  async create(
    @Body() data: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.authSesionMfaService.create(data, i18n);
  }

  @Post('confirm')
  async confirm(
    @Body() data: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    var dataConfirm = await this.authSesionMfaService.confirm(data)
    if (dataConfirm.success) {
      const tokenAsegurado = (
        await this.authTokenController.createTokenAsegurado({
          correo: data.correo,
          numeroCliente: data.numeroCliente,
          proyecto: data.proyecto,
        })
      ).data;
      dataConfirm.data = { token: tokenAsegurado }
    }
    return dataConfirm;
  }
}
