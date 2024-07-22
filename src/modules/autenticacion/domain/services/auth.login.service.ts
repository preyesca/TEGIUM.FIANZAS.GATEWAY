import { Controller } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { EEstatusUsuario } from 'src/app/common/enum/catalogo/estatus-usuario.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmUsuarioService } from 'src/modules/administracion/domain/services/adm.usuario.service';
import {
  ILoginDto,
  ILoginProyectoDto,
  ILoginResultDto,
  ILoginRolDto,
} from '../dto/auth.login.dto';
import { AuthSesionUsuarioService } from './auth.sesion-usuario.service';

@Controller()
export class AuthLoginService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly admUsuarioService: AdmUsuarioService,
    private readonly authSesionService: AuthSesionUsuarioService,
  ) {}

  //FIXME: 'LOGIN')
  async validateLogin(payload: {
    body: ILoginDto;
    lang: string;
  }): Promise<ResponseDto> {
    const response = await this.admUsuarioService.findUsuarioByEmail({
      email: payload.body.correoElectronico,
      lang: payload.lang,
    });

    const usuarioResult = response.data;

    if (!response.success) return response;

    if (usuarioResult.estatus.clave === EEstatusUsuario.REGISTRADO) {
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('autenticacion.ACCOUNT.ERROR.INACTIVE', {
          lang: payload.lang,
        }),
      );
    }

    const isMatch = await bcrypt.compare(
      payload.body.password,
      usuarioResult.contrasena,
    );

    if (!isMatch) {
      if (usuarioResult.intentos == 3) {
        return DefaultResponse.sendUnauthorized(
          'Su cuenta se encuentra bloqueada, favor de contactar con un administrador.',
        );
      }

      const updatedIntento: ResponseDto =
        await this.admUsuarioService.updateIntentos({
          id: usuarioResult._id,
          intento: usuarioResult.intentos + 1,
          lang: payload.lang,
        });

      if (updatedIntento.success) {
        if (updatedIntento.data.intentos == 3) {
          return DefaultResponse.sendUnauthorized(
            'Su cuenta se encuentra bloqueada, favor de contactar con un administrador.',
          );
        }
      }

      return DefaultResponse.sendConflict(
        this.i18n.translate(
          'autenticacion.ACCOUNT.ERROR.COMPARE_USER_AND_PASSWORD',
          {
            lang: payload.lang,
          },
        ),
      );
    } else {
      if (usuarioResult.estatus.clave === EEstatusUsuario.ACTIVO) {
        await this.admUsuarioService.updateIntentos({
          id: usuarioResult._id,
          intento: 0,
          lang: payload.lang,
        });
      }
    }

    const usuario = usuarioResult;

    if (usuario.estatus.clave === EEstatusUsuario.SUSPENDIDO)
      return DefaultResponse.sendUnauthorized(
        'Su cuenta se encuentra suspendida, favor de contactar con un administrador.',
      );

    if (usuario.estatus.clave === EEstatusUsuario.BLOQUEADO)
      return DefaultResponse.sendUnauthorized(
        'Su cuenta se encuentra bloqueada, favor de contactar con un administrador.',
      );

    if (usuario.estatus.clave === EEstatusUsuario.BAJA)
      return DefaultResponse.sendUnauthorized(
        'Su cuenta fue dada de baja. Contacte a un administrador.',
      );

    if (usuario.estatus.clave === EEstatusUsuario.BLOQUEADO_INACTIVIDAD)
      return DefaultResponse.sendUnauthorized(
        'Su cuenta fue bloqueada por inactividad, favor de contactar con un administrador.',
      );

    //Determina si el usuario tiene o no una sesion activa
    const activatedSession = await this.checkSession(
      usuario._id.toString(),
      payload.lang,
    );
    if (activatedSession.activatedSession) {
      if (activatedSession.waitLogin > 0) {
        const strMinuto =
          activatedSession.waitLogin == 1 ? 'minuto' : 'minutos';
        return DefaultResponse.sendUnauthorized(
          `El usuario cuenta con una sesión activa, favor de esperar <br> ${activatedSession.waitLogin} ${strMinuto}.`,
        );
      } else {
        this.authSesionService.signOff({
          usuario: usuario._id,
          lang: payload.lang,
        });
      }
    }

    const proyectos: Array<ILoginProyectoDto> = usuario.proyectos;
    const roles: Array<ILoginRolDto> = [];

    const proyectosConRoles = usuario.proyectos;

    // Iterar sobre cada proyecto
    for (const proyecto of proyectosConRoles) {
      if (proyecto.roles) {
        const rolesDelProyecto: Array<ILoginRolDto> = Object.values(
          proyecto.roles,
        ); //(proyecto.roles);
        roles.push(...rolesDelProyecto);
      }
    }

    const loginResult: ILoginResultDto = {
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        primerApellido: usuario.primerApellido,
        segundoApellido: usuario.segundoApellido,
        correoElectronico: usuario.correoElectronico,
      },
      proyectos,
    };
    return DefaultResponse.sendOk('', loginResult);
  }

  /**
   * Determina si se tiene una sesion activa o no
   * @param usuario ObjectId del usuario  a validar
   * @param lang Determina el lenguaje para usarlo en los mensajes de respuesta
   * @returns
   * true   =>  en caso de que la sesión del usuario este activa, no continua con el proceso
   * false  =>  en caso de que no se tenga una sesion activa, si continua con el proceso
   */
  async checkSession(usuario: string, lang: string) {
    const activeSession = await this.authSesionService.findOne({
      usuario,
      lang,
    });

    if (!activeSession) return { activatedSession: false, waitLogin: 0 };

    let waitLogin: Number | any = 0;
    const time_wait_login = Number(process.env.MSH_APP_TIME_LOGIN || 5);
    if (activeSession.fechaLogin == null) {
      await this.authSesionService.updateFechaLogin(usuario, lang);
      waitLogin = time_wait_login;
    } else {
      const currenteDate = moment();
      const loginDate = moment(activeSession.fechaLogin);
      const diffDates = currenteDate.diff(loginDate, 'minutes');
      waitLogin = time_wait_login > diffDates ? time_wait_login - diffDates : 0;
    }
    const data = {
      activatedSession: activeSession == null ? false : true,
      waitLogin,
    };

    return data;
  }

  /**
   * Inserta la session del usuario en la colección
   * @param usuario ObjectId de la coleccion de usuarios
   * @param lang Idioma para la respuesta
   * @returns retorna el documento que se creo en la colección
   */
  async addSession(usuario: string, lang: string) {
    return await this.authSesionService.create({ id: usuario, lang });
  }
}
