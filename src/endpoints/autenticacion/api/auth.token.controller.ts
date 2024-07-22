import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as moment from 'moment';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ERefreshTokenStatus } from 'src/app/common/enum/auth/refresh-token-status.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { AdmMenuPerfilService } from 'src/modules/administracion/domain/services/adm.menu-perfil.service';
import { AdmProyectoService } from 'src/modules/administracion/domain/services/adm.proyecto.service';
import { AdmUsuarioService } from 'src/modules/administracion/domain/services/adm.usuario.service';
import { AuthRefreshTokenDto } from 'src/modules/autenticacion/domain/dto/auth.refresh-token.dto';
import { AuthRefreshTokenService } from 'src/modules/autenticacion/domain/services/auth.refresh-token.service';
import { CatPerfilService } from 'src/modules/catalogo/domain/services/cat.perfil.service';
import { AuthCreateTokenAseguradoRequestDto } from '../helpers/auth.create-token-asegurado.request.dto';
import { AuthCreateTokenRequestDto } from '../helpers/auth.create-token.request.dto';
import { AuthRefreshTokenRequestDto } from '../helpers/auth.refresh-token.request.dto';

@Controller(`${SwaggerConsts.AUTHENTICATION.controller}/token`)
@ApiTags(SwaggerConsts.AUTHENTICATION.tag)
export class AuthTokenController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly admUsuarioService: AdmUsuarioService,
    private readonly catPerfilService: CatPerfilService,
    private readonly admProyectoService: AdmProyectoService,
    private readonly admMenuPerfilService: AdmMenuPerfilService,
    private readonly authRefreshTokenService: AuthRefreshTokenService,
  ) {}

  @Post('create')
  async login(
    @Body() body: AuthCreateTokenRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    if (!TokenValidator.isValid(body))
      return DefaultResponse.sendBadRequest(
        i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', { lang: i18n.lang }),
      );

    const [usuario, proyecto, rol] = await Promise.all([
      this.admUsuarioService.findOne({
        id: body.usuario,
        lang: i18n.lang,
      }),
      this.admProyectoService.findOne({
        id: body.proyecto,
        lang: i18n.lang,
      }),
      this.catPerfilService.findOne(body.rol, i18n),
    ]);

    const token = await this.generateToken(body);

    const fechaHoraCreacion = new Date();
    const fechaHoraExpiracion = new Date(fechaHoraCreacion);
    fechaHoraExpiracion.setMinutes(
      this.calculateTime(fechaHoraExpiracion.getMinutes()),
    );

    const refreshToken = await this.authRefreshTokenService.create({
      token,
      usuario: usuario.data._id,
      proyecto: proyecto.data._id,
      rol: rol.data._id,
      fechaHoraCreacion,
      fechaHoraExpiracion,
    } as AuthRefreshTokenDto);

    const { pathInicial } = await this.admMenuPerfilService.findByPerfil({
      proyecto: proyecto.data._id,
      rol: rol.data._id,
      lang: i18n.lang,
    });

    if (!refreshToken)
      return DefaultResponse.sendInternalError(
        i18n.translate('auth.REFRESH_TOKEN.CREATE_ERROR'),
      );

    return usuario.success && proyecto.success && rol.success
      ? DefaultResponse.sendOk('', {
          path: pathInicial,
          token,
          refreshToken,
        })
      : DefaultResponse.sendConflict(
          i18n.translate('auth.LOGIN.INFORMACION_INCORRECTA'),
        );
  }

  @Post('refresh')
  async refreshToken(
    @Body() body: AuthRefreshTokenRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    const refreshTokenResult = await this.authRefreshTokenService.findOne({
      refreshToken: body.refreshToken,
      lang: i18n.lang,
    });

    const { status, proyecto, usuario, rol } = refreshTokenResult.data;

    if (status === ERefreshTokenStatus.OK) {
      const token = await this.generateToken({
        usuario,
        proyecto,
        rol,
      } as AuthCreateTokenRequestDto);

      return DefaultResponse.sendOk('', {
        status,
        token,
      });
    }

    return DefaultResponse.sendOk('', {
      status,
    });
  }

  async createTokenAsegurado(body: AuthCreateTokenAseguradoRequestDto) {
    const token = await this.generateTokenAsegurado(body);
    return DefaultResponse.sendOk('', { token });
  }

  @Get('refreshTokenAsegurado')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async refreshTokenAsegurado(@Request() req: any) {
    const token = await this.generateTokenAsegurado({
      correo: req.user.correo,
      proyecto: req.user.proyecto,
      numeroCliente: req.user.numeroCliente,
    });
    return DefaultResponse.sendOk('', { token });
  }

  @Get('getTimeExpirationAsegurado')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getTimeExpirationAsegurado(@Request() req: any) {
    //Intervalo en segundos como reserva
    const SECONDS_INTERVALO = 10;

    //Fecha actual
    const momentStart = moment(new Date());

    const countMessage = process.env.MSH_JWT_PORTAL_COUNTDOWN_MESSAGE || '5m';

    let result = 0;
    var regex = /(\d+[a-z]+)/g;
    let match = regex.exec(countMessage);

    while (match != null) {
      var match_str = match[0];
      var last_char = match_str[match_str.length - 1];

      if (last_char == 'h')
        result += parseInt(match_str) * 3600;
      if (last_char == 'm')
        result += parseInt(match_str) * 60;
      if (last_char == 's')
        result += parseInt(match_str);
      match = regex.exec(countMessage);
    }


    //Fecha en la que expira el token
    const momentEnd = moment(new Date(req.user.jwtExpire * 1000));

    //Se obtiene la duracion entre la fecha final menos el intervalo  con la fecha actual
    const duration = moment.duration(
      momentEnd.add(-SECONDS_INTERVALO, 's').diff(momentStart),
    );

    //Obtiene la diferencia de las fechas en segundos
    let secondsCoundDowns = result //Number(duration.asSeconds().toFixed(0));

    //Variable que se utiliza para saber cuando mostrar el mensaje
    let secondsMessage = 0;

    //Si la diferencia es mayor a la variable de entorno, se asignan las variables y sus operaciones
    if (
      secondsCoundDowns > Number(process.env.MSH_JWT_PORTAL_COUNTDOWN_SECONDS)
    ) {
      secondsMessage =
        Number(secondsCoundDowns) -
        Number(process.env.MSH_JWT_PORTAL_COUNTDOWN_SECONDS);
      secondsCoundDowns = Number(process.env.MSH_JWT_PORTAL_COUNTDOWN_SECONDS);
    }

    const data = {
      secondsMessage,
      secondsCoundDowns,
    };
    return DefaultResponse.sendOk('', data);
  }

  private async generateToken(
    body: AuthCreateTokenRequestDto,
  ): Promise<string> {
    return await this.jwtService.signAsync(body);
  }

  private async generateTokenAsegurado(
    body: AuthCreateTokenAseguradoRequestDto,
  ): Promise<string> {
    return this.jwtService.sign(body, {
      expiresIn: process.env.MSH_JWT_PORTAL_EXPIRES_IN,
    });
  }

  private calculateTime(minutes: number): number {
    const timeStr: string = process.env.MSH_JRWT_EXPIRES_IN;
    if (timeStr.includes('m'))
      return minutes + Number(timeStr.replace(/m$/, ''));
    if (timeStr.includes('h'))
      return minutes + Number(timeStr.replace(/h$/, '')) * 60;
    return minutes + 1440; //Le agregamos 24h = 1440 min.
  }
}
