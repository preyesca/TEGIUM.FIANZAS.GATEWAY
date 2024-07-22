import { Controller } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { EEstatusUsuario } from 'src/app/common/enum/catalogo/estatus-usuario.enum';
import { ERol } from 'src/app/common/enum/catalogo/perfil.enum';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { NotificationConsts } from 'src/app/services/helpers/consts/notification.const';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { Utilities } from 'src/app/utils/utilities';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { BitNotificacionService } from 'src/modules/bitacora/domain/services/bit.notificacion.service';
import { CatSharedService } from 'src/modules/catalogo/domain/services/_cat.shared.service';
import { CatEstatusUsuarioRepository } from 'src/modules/catalogo/persistence/repository/cat.estatus-usuario.repository';
import { CatPaisRepository } from 'src/modules/catalogo/persistence/repository/cat.pais.repository';
import { CatPerfilRepository } from 'src/modules/catalogo/persistence/repository/cat.perfil.repository';
import { AdmUsuario } from '../../persistence/database/adm.usuario.schema';
import { AdmProyectoRepository } from '../../persistence/repository/adm.proyecto.repository';
import { AdmUsuarioRepository } from '../../persistence/repository/adm.usuario.repository';
import { AdmContrasenaDto } from '../dto/adm.contrasena.dto';
import { AdmRecoverPasswordDto } from '../dto/adm.recover-password.dto';
import { AdmUpdateClaveDto } from '../dto/adm.update-clave.dto';
import { AdmUsuarioDto } from '../dto/adm.usuario.dto';
import { AuthSesionUsuarioRepository } from 'src/modules/autenticacion/persistence/repository/auth.sesion-usuario.repository';
import { EBitNotificacionType } from 'src/app/common/enum/notificaciones.enum';

@Controller()
export class AdmUsuarioService {
  readonly DEFAULT = {
    create: {
      estatus: 'Registrado',
    },
    activateAccount: {
      estatus: 'Activo',
      estatusPermitidos: [
        'Registrado',
        'Bloqueado',
        'Bloqueado por inactividad',
      ],
    },
  };
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly admUsuarioRepository: AdmUsuarioRepository,
    private readonly admProyectoRepository: AdmProyectoRepository,
    private readonly bitNotificacionService: BitNotificacionService,
    private readonly catEstatusUsuarioRepository: CatEstatusUsuarioRepository,
    private readonly catPaisRepository: CatPaisRepository,
    private readonly catPerfilRepository: CatPerfilRepository,
    private readonly catSharedService: CatSharedService,
    private readonly authSesionUsuarioRepository: AuthSesionUsuarioRepository
  ) { }

  //FIXME: RMQServices_Administracion.USUARIO.recoverPassword
  async recoverPassword(payload: {
    body: AdmRecoverPasswordDto;
    i18nContext: I18nContext;
  }): Promise<ResponseDto> {
    const { body, i18nContext } = payload;

    const user: any = await this.admUsuarioRepository.findByEmailAddress(
      body.email,
    );

    if (!user) {
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.USUARIO', {
          lang: i18nContext.lang,
        }),
      );
    }

    if (EEstatusUsuario.ACTIVO != user.estatus) {
      if (EEstatusUsuario.REGISTRADO == user.estatus) {
        return DefaultResponse.sendConflict(
          this.i18n.translate('autenticacion.ACCOUNT.ERROR.INACTIVE', {
            lang: i18nContext.lang,
          }),
        );
      } else {
        return DefaultResponse.sendConflict(
          this.i18n.translate('autenticacion.ACCOUNT.ERROR.BLOCKED', {
            lang: i18nContext.lang,
          }),
        );
      }
    }

    const password = Utilities.generatePassword();

    const updated = await this.admUsuarioRepository.updatePassword(
      user._id.toString(),
      password,
    );

    if (!updated)
      return DefaultResponse.sendConflict(
        this.i18n.translate('all.MESSAGES.ERROR.UPDATED', {
          lang: i18nContext.lang,
        }),
      );

    const bodyNotification = {
      mailOptions: {
        to: [user.correoElectronico],
      },
      nombreUsuario: `${user.nombre} ${user.primerApellido} ${user.segundoApellido ?? ''
        }`.trim(),
      password,
      correoElectronico: user.correoElectronico,
      lang: i18nContext.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18nContext,
      EBitNotificacionType.MARSH_NOTIFICACION_RECUPERAR_PASSWORD,
      null,
      bodyNotification
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.NOTIFICATION', {
        lang: i18nContext.lang,
      }),
    );
  }

  //FIXME: RMQServices_Administracion.USUARIO.create
  async create(payload: {
    body: AdmUsuarioDto;
    session: SessionTokenDto;
    bearer: string | undefined;
    i18nContext: I18nContext;
  }): Promise<ResponseDto> {
    const { body, session, bearer, i18nContext } = payload;

    if (!TokenValidator.isValid(session) || !bearer)
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: i18nContext.lang,
        }),
      );

    if (
      await this.admUsuarioRepository.findByEmailAddress(body.correoElectronico)
    )
      return DefaultResponse.sendConflict(
        this.i18n.translate('administracion.VALIDATIONS.EXISTS.EMAIL', {
          lang: i18nContext.lang,
        }),
      );

    for (const proyecto of body.proyectos) {
      if (!(await this.catPaisRepository.findOneByClave(proyecto.pais)))
        return DefaultResponse.sendNotFound(
          this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.PAIS', {
            lang: i18nContext.lang,
          }),
        );

      if (
        !(await this.admProyectoRepository.findOne(
          proyecto.proyecto.toString(),
        ))
      )
        return DefaultResponse.sendNotFound(
          this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.PROYECTO', {
            lang: i18nContext.lang,
          }),
        );

      for (const perfil of proyecto.perfiles) {
        if (!(await this.catPerfilRepository.findOneByClave(perfil)))
          return DefaultResponse.sendNotFound(
            this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.PERFIL', {
              lang: i18nContext.lang,
            }),
          );
      }

      proyecto.proyecto = new Types.ObjectId(proyecto.proyecto);
    }

    const estatus = await this.catEstatusUsuarioRepository.findOneByDescripcion(
      this.DEFAULT.create.estatus,
    );

    if (!estatus)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_USUARIO', {
          lang: i18nContext.lang,
        }),
      );

    body.estatus = estatus.clave;

    const created: any = await this.admUsuarioRepository.create(body);

    const bodyNotification = {
      mailOptions: {
        to: [created.correoElectronico],
      },
      _id: created._id,
      nombreUsuario: `${created.nombre} ${created.primerApellido} ${created.segundoApellido ?? ''
        }`.trim(),
      correoElectronico: created.correoElectronico,
      lang: i18nContext.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18nContext,
      EBitNotificacionType.MARSH_NOTIFICACION_ACTIVAR_CUENTA,
      session,
      bodyNotification,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: i18nContext.lang,
      }),
      created,
    );
  }

  //FIXME: RMQServices_Administracion.USUARIO.activateUsuario
  async activateAccount(payload: {
    id: string;
    body: AdmContrasenaDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const user = await this.admUsuarioRepository.findOne(payload.id);

    if (!user)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.USUARIO', {
          lang: payload.lang,
        }),
      );

    const currentEstatus =
      await this.catEstatusUsuarioRepository.findOneByClave(user.estatus);

    if (!currentEstatus)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_USUARIO', {
          lang: payload.lang,
        }),
      );

    if (
      !this.DEFAULT.activateAccount.estatusPermitidos.some(
        (ep) => ep === currentEstatus.descripcion,
      )
    )
      return DefaultResponse.sendConflict(
        this.i18n.translate(
          'autenticacion.ACCOUNT.ERROR.PREVIOUSLY_ACTIVATED',
          {
            lang: payload.lang,
          },
        ),
      );

    const estatus = await this.catEstatusUsuarioRepository.findOneByDescripcion(
      this.DEFAULT.activateAccount.estatus,
    );

    if (!estatus)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_USUARIO', {
          lang: payload.lang,
        }),
      );

    const activated = await this.admUsuarioRepository.activateAccount(
      payload.id,
      payload.body.contrasena,
      estatus.clave,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('autenticacion.ACCOUNT.SUCCESS.ACTIVATED', {
        lang: payload.lang,
      }),
      activated,
    );
  }

  //FIXME: RMQServices_Administracion.USUARIO.paginate
  async paginateAll(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: payload.lang,
        }),
      );

    const perfil = await this.catPerfilRepository.findOne(payload.session.rol);

    const proyecto =
      perfil.clave === ERol.HELPDESK_EXTERNO
        ? payload.session.proyecto
        : undefined;

    const dataPaginate = await this.admUsuarioRepository.paginateAll(
      proyecto,
      payload.paginateParams,
    );

    const claves = dataPaginate.docs.reduce(
      (value: any, user: any) => {
        value.estatusClaves.add(user.estatus);
        value.paisClaves.add(user.proyectos[0].pais);
        return value;
      },
      {
        estatusClaves: new Set<number>(),
        paisClaves: new Set<number>(),
      },
    );
    const [estatus, paises, perfiles, sesiones]: [any[], any[], any[], any[]] =
      await Promise.all([
        this.catEstatusUsuarioRepository.selectInByClave(
          Array.from(claves.estatusClaves),
        ),
        this.catPaisRepository.selectInByClave(Array.from(claves.paisClaves)),
        this.catPerfilRepository.getAll(),
        this.authSesionUsuarioRepository.selectActive()
      ]);

    dataPaginate.docs = dataPaginate.docs.map((user: any) => {
      const perfilesClaves = user.proyectos[0].perfiles;
      // Obtener los nombres de los perfiles correspondientes y las claves
      const nombresPerfiles = perfilesClaves.map((clavePerfil: number) => {
        const perfil = perfiles.find((_) => _.clave === clavePerfil);
        return perfil ? perfil.descripcion : null;
      });
      const idsPerfiles = perfilesClaves.map((clavePerfil: number) => {
        const perfil = perfiles.find((_) => _.clave === clavePerfil);
        return perfil ? perfil.clave : null;
      });

      return {
        _id: user._id,
        paisIcon: paises.find((_) => _.clave === user.proyectos[0].pais)?.icon,
        paisDescripcion: paises.find((_) => _.clave === user.proyectos[0].pais)
          ?.descripcion,
        nombreCompleto: `${user.nombre} ${user.primerApellido} ${user.segundoApellido ?? ''
          }`.trim(),
        correoElectronico: user.correoElectronico,
        rol: idsPerfiles,
        nombreRol: nombresPerfiles,
        estatus: estatus.find((_) => _.clave === user.estatus)?.descripcion,
        sesionAbierta: sesiones.find(x => x.usuario.toString() == user._id.toString()) == undefined ? false : true,
        activo: user.activo,
      };
    });

    return DefaultResponse.sendOk('', dataPaginate);
  }

  //FIXME: RMQServices_Administracion.USUARIO.findAll
  async findAll(@I18n() i18n: I18nContext): Promise<ResponseDto> {
    const users = await this.admUsuarioRepository.findAll();
    const ids = users.docs.reduce(
      (value, user) => {
        value.estatusIds.add(user.estatus);
        if (user.proyectos && user.proyectos.length > 0) {
          for (const proyecto of user.proyectos) {
            if (Array.isArray(proyecto.perfiles)) {
              for (const perfilId of proyecto.perfiles) {
                if (!value.perfilIds.has(perfilId)) {
                  value.perfilIds.add(perfilId);
                }
              }
            }
            value.paisIds.add(proyecto.pais);
            value.proyectoIds.add(proyecto.proyecto.toString());
          }
        }
        return value;
      },
      {
        paisIds: new Set<number>(),
        proyectoIds: new Set<string>(),
        perfilIds: new Set<number>(),
        estatusIds: new Set<number>(),
      },
    );

    const [paises, proyectos, estatus, perfiles]: [any[], any[], any[], any[]] =
      await Promise.all([
        this.catPaisRepository.selectInByClave(Array.from(ids.paisIds)),
        this.admProyectoRepository.selectIn(Array.from(ids.proyectoIds)),
        this.catEstatusUsuarioRepository.selectInByClave(
          Array.from(ids.estatusIds),
        ),
        this.catPerfilRepository.selectInByClave(Array.from(ids.perfilIds)),
      ]);

    users.docs = users.docs.map((user: any) => {
      return {
        _id: user._id,
        nombre: user.nombre,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        correoElectronico: user.correoElectronico,
        pais: paises.find((_) => _.clave == user.pais),
        proyecto: proyectos, //proyectos.find((p) => user.proyecto.equals(p._id)),
        estatus: estatus.find((_) => _.clave == user.estatus),
        perfil: perfiles.find((_) => _.clave == user.perfil),
      };
    });

    return DefaultResponse.sendOk('', users);
  }

  //FIXME: RMQServices_Administracion.USUARIO.findOne
  async findOne(payload: { id: string; lang: string }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const user: any = await this.admUsuarioRepository.findOne(payload.id);

    if (!user)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.USUARIO', {
          lang: payload.lang,
        }),
      );

    let proyectos = await Promise.all(
      user.proyectos.map(async (userProject: any) => {
        const found = await this.admProyectoRepository.findOne(
          userProject.proyecto,
        );

        return found
          ? {
            _id: userProject.proyecto.toString(),
            pais: userProject.pais,
            roles: userProject.perfiles,
            subroles: userProject.sub_perfiles ?? [],
            codigo: found.codigo,
            proceso: found.proceso,
          }
          : null;
      }),
    );

    const estatus = await this.catEstatusUsuarioRepository.findOneByClave(
      user.estatus,
    );

    for (const proyecto of proyectos) {
      if (proyecto.roles && proyecto.roles.length > 0) {
        const rolesConPerfiles = await Promise.all(
          proyecto.roles.map(async (perfilId) => {
            const perfilResultado =
              await this.catPerfilRepository.findOneByClave(perfilId);
            return perfilResultado;
          }),
        );
        proyecto.roles = rolesConPerfiles;
      }

      if (proyecto.subroles && proyecto.subroles.length > 0) {
        const subrolesConPerfiles = await Promise.all(
          proyecto.subroles.map(async (perfilId) => {
            const perfilResultado =
              await this.catPerfilRepository.findOneByClave(perfilId);
            return perfilResultado;
          }),
        );
        proyecto.subroles = subrolesConPerfiles;
      }

      const pais = await this.catPaisRepository.findOneByClave(proyecto.pais);

      proyecto.pais = pais;
    }

    const data: any = {
      _id: user._id,
      nombre: user.nombre,
      primerApellido: user.primerApellido,
      segundoApellido: user.segundoApellido,
      correoElectronico: user.correoElectronico,
      contrasena: user.contrasena,
      proyectos: proyectos.map((proyecto) => ({
        _id: proyecto._id,
        pais: { ...proyecto.pais },
        roles: { ...proyecto.roles },
        subroles: [...proyecto.subroles] ?? [],
        codigo: proyecto.codigo,
      })),
      estatus,
      intentos: !user.intentos ? 0 : user.intentos,
    };

    const jsonData = data;
    return DefaultResponse.sendOk('', jsonData);
  }

  //FIXME: RMQServices_Administracion.USUARIO.findOneToEdit
  async findOneToEdit(payload: {
    id: string;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: payload.lang,
        }),
      );

    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const user = await this.admUsuarioRepository.findOne(payload.id);

    if (!user)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.USUARIO', {
          lang: payload.lang,
        }),
      );

    const catalagosResult =
      await this.catSharedService.usuario_createGetCatalogos();

    if (!catalagosResult) return catalagosResult;

    const catalogos = { ...catalagosResult.data };
    const proyectos = await this.admProyectoRepository.getAll();

    catalogos.proyectos = proyectos.map((p: any) => {
      return {
        _id: p._id,
        codigo: p.codigo,
        pais: p.pais,
      };
    });

    const currentRol = catalogos.perfiles.find(
      (p: any) => p._id.toString() === payload.session.rol,
    );

    if (!currentRol)
      return DefaultResponse.sendConflict(
        this.i18n.translate('server.JWTOKEN.ERROR.ROL', {
          lang: payload.lang,
        }),
      );

    //RN:::REGISTRADO: Si el Rol no es Registrado, no mostrar
    if (user.estatus !== EEstatusUsuario.REGISTRADO)
      catalogos.estatus = catalogos.estatus.filter(
        (e: any) => e.clave !== EEstatusUsuario.REGISTRADO,
      );

    //RN:::ADMINISTRADOR: Si no es administrador, no debe editar a un admin
    if (currentRol.clave !== ERol.ADMINISTRADOR)
      catalogos.perfiles = catalogos.perfiles.filter(
        (p: any) => p.clave !== ERol.ADMINISTRADOR,
      );

    ////RN:::HELPDESK_EXTERNO: Solo puede configurar usuarios del proyecto asignado a su usuario
    if (currentRol.clave === ERol.HELPDESK_EXTERNO) {
      const { proyectos } = await this.admUsuarioRepository.findOne(
        payload.session.usuario,
      );
      let proyectosAux = [];
      catalogos.proyectos.forEach((pr) => {
        proyectos.forEach((p: any) => {
          if (pr._id.equals(p.proyecto)) {
            proyectosAux.push(pr);
            return;
          }
        });
      });
      catalogos.proyectos = proyectosAux;
    }

    const data: any = {
      usuario: {
        nombre: user.nombre,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        correoElectronico: user.correoElectronico,
        // proyecto: user.proyecto,
        //pais: catalogos?.paises.find((p: any) => p.clave === user.pais)?.clave,
        // perfil: catalogos?.perfiles.find((p: any) => p.clave === user.perfil)
        //   ?.clave,
        proyectos: user.proyectos,
        estatus: catalogos?.estatus.find((p: any) => p.clave === user.estatus)
          ?.clave,
      },
      catalogos,
    };

    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Administracion.USUARIO.getCatalogosToCreate
  async getCatalogosToCreate(payload: {
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: payload.lang,
        }),
      );

    const catalogosResult =
      await this.catSharedService.usuario_createGetCatalogos();

    if (!catalogosResult) return catalogosResult;

    const catalogos = { ...catalogosResult.data };

    const proyectos = await this.admProyectoRepository.getAll();

    catalogos.proyectos = proyectos.map((p: any) => {
      return {
        _id: p._id,
        codigo: p.codigo,
        pais: p.pais,
      };
    });

    const currentRol = catalogos.perfiles.find(
      (p: any) => p._id.toString() === payload.session.rol,
    );

    if (!currentRol)
      return DefaultResponse.sendConflict(
        this.i18n.translate('server.JWTOKEN.ERROR.ROL', {
          lang: payload.lang,
        }),
      );

    //RN:::ADMINISTRADOR: Solo los administradores pueden dar de alta a otro administradores
    if (currentRol.clave !== ERol.ADMINISTRADOR) {
      catalogos.perfiles = catalogos.perfiles.filter(
        (p: any) => p.clave !== ERol.ADMINISTRADOR,
      );
    }

    //RN:::HELPDESK_EXTERNO: Solo puede configurar usuarios del proyecto asignado a su usuario
    if (currentRol.clave === ERol.HELPDESK_EXTERNO) {
      const { proyectos } = await this.admUsuarioRepository.findOne(
        payload.session.usuario,
      );
      let proyectosAux = [];
      catalogos.proyectos.forEach((pr) => {
        proyectos.forEach((p: any) => {
          if (pr._id.equals(p.proyecto)) {
            proyectosAux.push(pr);
            return;
          }
        });
      });
      catalogos.proyectos = proyectosAux;
    }
    /* if (currentRol.clave === ERol.HELPDESK_EXTERNO)
      catalogos.proyectos = catalogos.proyectos.filter((p: any) =>
        p._id.equals(payload.session.proyecto),
      ); */

    return DefaultResponse.sendOk('', catalogos);
  }

  //FIXME: RMQServices_Administracion.USUARIO.findName
  async findName(payload: { id: string; lang: string }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const {data} = await this.findOne(payload)

    return data
      ? DefaultResponse.sendOk('', {nombre:data.nombre, estatus:data.estatus.descripcion})
      : DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.USUARIO', {
          lang: payload.lang,
        }),
      );
  }

  //FIXME: RMQServices_Administracion.USUARIO.findByCorreo
  async findUsuarioByEmail(payload: {
    email: string;
    lang: string;
  }): Promise<ResponseDto> {
    const user: any = await this.admUsuarioRepository.findByEmailAddress(
      payload.email,
    );

    if (!user)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.USUARIO', {
          lang: payload.lang,
        }),
      );

    const proyectos = await Promise.all(
      user.proyectos.map(async (userProject: any) => {
        const found = await this.admProyectoRepository.findOne(
          userProject.proyecto,
        );

        return found
          ? {
            _id: userProject.proyecto.toString(),
            pais: userProject.pais,
            roles: userProject.perfiles,
            codigo: found.codigo,
            proceso: found.proceso,
          }
          : null;
      }),
    );

    const estatus = await this.catEstatusUsuarioRepository.findOneByClave(
      user.estatus,
    );

    for (const proyecto of proyectos) {
      if (proyecto.roles && proyecto.roles.length > 0) {
        const rolesConPerfiles = await Promise.all(
          proyecto.roles.map(async (perfilId) => {
            const perfilResultado =
              await this.catPerfilRepository.findOneByClave(perfilId);
            return perfilResultado;
          }),
        );

        proyecto.roles = rolesConPerfiles;
      }

      const pais = await this.catPaisRepository.findOneByClave(proyecto.pais);

      proyecto.pais = pais;
    }

    const data: any = {
      _id: user._id,
      nombre: user.nombre,
      primerApellido: user.primerApellido,
      segundoApellido: user.segundoApellido,
      correoElectronico: user.correoElectronico,
      contrasena: user.contrasena,
      proyectos: proyectos.map((proyecto) => ({
        _id: proyecto._id,
        pais: proyecto.pais,
        roles: [...proyecto.roles],
        codigo: proyecto.codigo,
        proceso: proyecto.proceso,
      })),
      estatus,
      intentos: !user.intentos ? 0 : user.intentos,
    };

    const jsonData = data; //JSON.stringify(data, null, 2);
    return DefaultResponse.sendOk('', jsonData);
  }

  //FIXME: RMQServices_Administracion.USUARIO.update)
  async update(payload: {
    id: string;
    body: AdmUsuarioDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    for (const proyecto of payload.body.proyectos) {
      if (!(await this.catPaisRepository.findOneByClave(proyecto.pais)))
        return DefaultResponse.sendNotFound(
          this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.PAIS', {
            lang: payload.lang,
          }),
        );

      if (
        !(await this.admProyectoRepository.findOne(
          proyecto.proyecto.toString(),
        ))
      )
        return DefaultResponse.sendNotFound(
          this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.PROYECTO', {
            lang: payload.lang,
          }),
        );

      for (const perfil of proyecto.perfiles) {
        if (!(await this.catPerfilRepository.findOneByClave(perfil)))
          return DefaultResponse.sendNotFound(
            this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.PERFIL', {
              lang: payload.lang,
            }),
          );
      }

      proyecto.proyecto = new Types.ObjectId(proyecto.proyecto);
    }

    if (
      !(await this.catEstatusUsuarioRepository.findOneByClave(
        payload.body.estatus,
      ))
    )
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_USUARIO', {
          lang: payload.lang,
        }),
      );

    const user = await this.admUsuarioRepository.findOne(payload.id);

    if (!user)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.USUARIO', {
          lang: payload.lang,
        }),
      );

    const userEmail = await this.admUsuarioRepository.findByEmailAddress(
      payload.body.correoElectronico,
    );

    if (userEmail) {
      if (user.correoElectronico != userEmail.correoElectronico)
        return DefaultResponse.sendConflict(
          this.i18n.translate('administracion.VALIDATIONS.EXISTS.EMAIL', {
            lang: payload.lang,
          }),
        );
    }

    const updated = await this.admUsuarioRepository.update(
      payload.id,
      payload.body,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
      updated,
    );
  }

  //FIXME: RMQServices_Administracion.USUARIO.updateClave
  async updateClave(payload: {
    id: string;
    body: AdmUpdateClaveDto;
    lang: string;
  }): Promise<ResponseDto> {
    const { body, lang } = payload;

    const user: any = await this.admUsuarioRepository.findByEmailAddress(
      body.correoElectronico,
    );

    if (!user) {
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.USUARIO', {
          lang,
        }),
      );
    }

    const isMatch = await bcrypt.compare(body.currentPassword, user.contrasena);

    if (!isMatch) {
      return DefaultResponse.sendConflict(
        this.i18n.translate('autenticacion.ACCOUNT.ERROR.PASSWORD_COMPARISON'),
      );
    }

    const updated = await this.admUsuarioRepository.updatePassword(
      payload.id,
      body.newPassword,
    );

    if (!updated)
      return DefaultResponse.sendConflict(
        this.i18n.translate('all.MESSAGES.ERROR.UPDATED', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
    );
  }

  //FIXME: RMQServices_Administracion.USUARIO.updatePassword
  async updatePassword(payload: {
    id: string;
    body: AdmContrasenaDto;
    lang: string;
  }): Promise<ResponseDto> {
    const updated = await this.admUsuarioRepository.updatePassword(
      payload.id,
      payload.body.contrasena,
    );

    if (!updated)
      return DefaultResponse.sendConflict(
        this.i18n.translate('all.MESSAGES.ERROR.UPDATED', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
    );
  }

  //FIXME: RMQServices_Administracion.USUARIO.selectIn
  async selectIn(ids: any): Promise<AdmUsuario[]> {
    return await this.admUsuarioRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Administracion.USUARIO.updateIntento
  async updateIntentos(payload: {
    id: string;
    intento: number;
    lang: string;
  }): Promise<ResponseDto> {
    const updated = await this.admUsuarioRepository.updateIntentos(
      payload.id,
      payload.intento,
    );

    if (!updated)
      return DefaultResponse.sendConflict(
        this.i18n.translate('all.MESSAGES.ERROR.UPDATED', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
      updated,
    );
  }

  //FIXME: RMQServices_Administracion.USUARIO.findManyByPerfilProyecto
  async findManyPerfilProyecto(payload: {
    proyecto: string;
    perfil: number;
    lang: string;
  }): Promise<ResponseDto> {
    const users = await this.admUsuarioRepository.findManyByPerfilProyecto(
      payload.proyecto,
      payload.perfil,
    );

    return DefaultResponse.sendOk('', users);
  }

  //FIXME: RMQServices_Administracion.USUARIO.selectManyNamesIn
  async selectManyNamesIn({ ids }: { ids: string[] }): Promise<AdmUsuario[]> {
    return await this.admUsuarioRepository.selectManyIn(ids);
  }
}
