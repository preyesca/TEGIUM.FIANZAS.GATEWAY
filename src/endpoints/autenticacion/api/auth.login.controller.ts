import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { AdmMenuPerfilService } from 'src/modules/administracion/domain/services/adm.menu-perfil.service';
import { AuthLoginService } from 'src/modules/autenticacion/domain/services/auth.login.service';
import { AuthSesionMfaService } from 'src/modules/autenticacion/domain/services/auth.sesion-mfa.service';
import { CoreInformacionContactoService } from 'src/modules/core/domain/services/core.informacion-contacto.service';
import { AuthLoginAseguradoRequestDto } from '../helpers/auth.login-asegurado.request.dto';
import { AuthLoginRequestDto } from '../helpers/auth.login.request.dto';
import {
  ILoginAuthResponse,
  ILoginResponseDto,
  ILoginSingleResponse,
} from '../helpers/auth.login.response';
import { AuthTokenController } from './auth.token.controller';

@Controller(SwaggerConsts.AUTHENTICATION.controller)
@ApiTags(SwaggerConsts.AUTHENTICATION.tag)
export class AuthLoginController {
  private readonly _logger = new Logger(AuthLoginController.name);

  constructor(
    @Inject(AuthTokenController)
    private readonly authTokenController: AuthTokenController,
    private readonly authSesionMfaService: AuthSesionMfaService,
    private readonly admMenuPerfilService: AdmMenuPerfilService,
    private readonly authLoginService: AuthLoginService,
    private readonly coreInformacionContactoService: CoreInformacionContactoService,
  ) { }

  @Post('login')
  async login(
    @Body() body: AuthLoginRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const loginResult: ResponseDto = await this.authLoginService.validateLogin({
      body,
      lang: i18n.lang,
    });

    if (!loginResult.success) return loginResult;

    const { usuario, proyectos } = <ILoginAuthResponse>loginResult.data;

    //REVIEW: Está tomando el primer proyecto
    const rolesProyecto = proyectos[0];
    const roles = rolesProyecto.roles;
    const arregloRoles = [];
    for (const key in roles) {
      if (roles.hasOwnProperty(key)) {
        arregloRoles.push(roles[key]);
      }
    }

    // RN: Si el usuario esta asignado a un proyecto y tiene un solo rol,
    // inicia sesión directamente
    if (proyectos.length === 1 && proyectos[0].roles.length === 1) {
      const tokenResult = await this.authTokenController.login(
        {
          usuario: usuario._id,
          proyecto: proyectos[0]._id,
          rol: arregloRoles[0]._id,
        },
        i18n,
      );

      const { pathInicial } = await this.admMenuPerfilService.findByPerfil({
        proyecto: proyectos[0]._id,
        rol: arregloRoles[0]._id,
        lang: i18n.lang,
      });

      if (!tokenResult.success) return tokenResult;
      const { token, refreshToken } = tokenResult.data;

      await this.authLoginService.addSession(usuario._id, i18n.lang);

      return DefaultResponse.sendOk('', {
        path: pathInicial,
        needToChoose: false,
        data: {
          token,
          refreshToken,
          usuario,
          proyectos,
        } as ILoginSingleResponse,
      } as ILoginResponseDto<ILoginSingleResponse>);
    }

    await this.authLoginService.addSession(usuario._id, i18n.lang);

    return DefaultResponse.sendOk('', {
      path: 'authentication/select-project',
      needToChoose: true,
      data: loginResult.data,
    } as ILoginResponseDto<ILoginSingleResponse>);
  }

  @Post('loginAsegurado')
  async loginAsegurado(
    @Body() body: AuthLoginAseguradoRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const loginResult: ResponseDto =
      await this.coreInformacionContactoService.findEmailsByNumeroCliente({
        body,
        lang: i18n.lang,
      });

    if (!loginResult.success) return loginResult;

    if (
      loginResult.data.emails.length === 0 ||
      !loginResult.data.emails.includes(body.correoElectronico)
    )
      return DefaultResponse.sendNotFound('Usuario y/o contraseña incorrectos');

    const data = {
      path: 'administration',
      correo: body.correoElectronico,
      titular: {
        proyecto: loginResult.data.titular.proyecto,
        nombre: loginResult.data.titular.nombre,
        numeroCliente: loginResult.data.titular.numeroCliente,
      },
      contratos: loginResult.data.contratos,
    };

    //REVIEW
    const dataCode = <any>{
      correo: data.correo,
      nombreUsuario: data.titular.nombre,
    };

    await this.authSesionMfaService.create(dataCode, i18n);

    return DefaultResponse.sendOk('', data);
  }
}
