import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { EProceso } from 'src/app/common/enum/catalogo/proceso.enum';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { CatSharedService } from 'src/modules/catalogo/domain/services/_cat.shared.service';
import { CatEstatusGeneralRepository } from 'src/modules/catalogo/persistence/repository/cat.estatus-general.repository';
import { CatNegocioRepository } from 'src/modules/catalogo/persistence/repository/cat.negocio.repository';
import { CatPaisRepository } from 'src/modules/catalogo/persistence/repository/cat.pais.repository';
import { CatPerfilRepository } from 'src/modules/catalogo/persistence/repository/cat.perfil.repository';
import { CatProcesoRepository } from 'src/modules/catalogo/persistence/repository/cat.proceso.repository';
import { CatRamoRepository } from 'src/modules/catalogo/persistence/repository/cat.ramo.repository';
import { AdmAseguradoraRepository } from '../../persistence/repository/adm.aseguradora.repository';
import { AdmMenuPerfilRepository } from '../../persistence/repository/adm.menu-perfil.repository';
import { AdmPermisoPerfilRepository } from '../../persistence/repository/adm.permiso-perfil.repository';
import { AdmProyectoConfiguracionRepository } from '../../persistence/repository/adm.proyecto-configuracion.repository';
import { AdmProyectoRepository } from '../../persistence/repository/adm.proyecto.repository';
import { AdmMenuPerfilDto } from '../dto/adm.menu-perfil.dto';
import { AdmPermisoPerfilDto } from '../dto/adm.permiso-perfil.dto';
import { AdmProyectoDto } from '../dto/adm.proyecto.dto';

@Controller()
export class AdmProyectoService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly catSharedService: CatSharedService,
    private readonly catPaisRepository: CatPaisRepository,
    private readonly catRamoRepository: CatRamoRepository,
    private readonly catPerfilRepository: CatPerfilRepository,
    private readonly catNegocioRepository: CatNegocioRepository,
    private readonly catProcesoRepository: CatProcesoRepository,
    private readonly admProyectoRepository: AdmProyectoRepository,
    private readonly admMenuPerfilRepository: AdmMenuPerfilRepository,
    private readonly admAseguradoraRepository: AdmAseguradoraRepository,
    private readonly admPermisoPerfilRepository: AdmPermisoPerfilRepository,
    private readonly catEstatusGeneralRepository: CatEstatusGeneralRepository,
    private readonly admProyectoConfiguracionRepository: AdmProyectoConfiguracionRepository,
  ) {}

  //FIXME: RMQServices_Administracion.PROYECTO.create
  async create(payload: {
    body: AdmProyectoDto;
    lang: string;
  }): Promise<ResponseDto> {
    const pais = await this.catPaisRepository.findOneByClave(payload.body.pais);

    if (!pais)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.PAIS', {
          lang: payload.lang,
        }),
      );

    const ramo = await this.catRamoRepository.findOneByClave(payload.body.ramo);

    if (!ramo)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.RAMO', {
          lang: payload.lang,
        }),
      );

    const negocio = await this.catNegocioRepository.findOneByClave(
      payload.body.negocio,
    );

    if (!negocio)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.NEGOCIO', {
          lang: payload.lang,
        }),
      );

    const proceso = await this.catProcesoRepository.findOneByClave(
      payload.body.proceso,
    );

    if (!proceso)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.PROCESO', {
          lang: payload.lang,
        }),
      );

    const estatus = await this.catEstatusGeneralRepository.findOneByClave(
      payload.body.estatus,
    );

    if (!estatus)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_GENERAL', {
          lang: payload.lang,
        }),
      );

    const aseguradora: any = await this.admAseguradoraRepository.findOne(
      payload.body.aseguradora.toString(),
    );

    if (!aseguradora)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'administracion.VALIDATIONS.NOT_FOUND.ASEGURADORA',
          {
            lang: payload.lang,
          },
        ),
      );

    payload.body.aseguradora = new Types.ObjectId(payload.body.aseguradora);

    const existe = await this.admProyectoRepository.exists(
      payload.body.pais,
      payload.body.ramo,
      payload.body.proceso,
      payload.body.negocio,
      payload.body.aseguradora.toString(),
      payload.body.portal,
    );

    if (existe)
      return DefaultResponse.sendConflict(
        this.i18n.translate('administracion.VALIDATIONS.EXISTS.PROYECTO', {
          lang: payload.lang,
        }),
      );

    const created: any = await this.admProyectoRepository.create(payload.body);
    await this.createMenuYPermisos(created._id, payload.body.proceso);
    await this.admProyectoConfiguracionRepository.create({
      nombreCliente: payload.body.nombreCliente ?? '',
      nombreComercial: payload.body.nombreComercial ?? '',
      proyecto: created._id,
    });

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  //FIXME: RMQServices_Administracion.PROYECTO.findAll
  async findAll(payload: { lang?: string }): Promise<ResponseDto> {
    const proyectos = await this.admProyectoRepository.getAll();

    const ids = proyectos.reduce(
      (value, user) => {
        value.paisIds.add(user.pais);
        value.ramoIds.add(user.ramo);
        value.procesoIds.add(user.proceso);
        value.negocioIds.add(user.negocio);
        value.estatusIds.add(user.estatus);
        value.aseguradoraIds.add(user.aseguradora.toString());
        return value;
      },
      {
        paisIds: new Set<number>(),
        ramoIds: new Set<number>(),
        procesoIds: new Set<number>(),
        negocioIds: new Set<number>(),
        estatusIds: new Set<number>(),
        aseguradoraIds: new Set<string>(),
      },
    );

    const [paises, estatusGenerales, ramos, procesos, negocios, aseguradoras]: [
      any[],
      any[],
      any[],
      any[],
      any[],
      any[],
    ] = await Promise.all([
      this.catPaisRepository.selectInByClave(Array.from(ids.paisIds)),
      this.catEstatusGeneralRepository.selectInByClave(
        Array.from(ids.estatusIds),
      ),
      this.catRamoRepository.selectInByClave(Array.from(ids.ramoIds)),
      this.catProcesoRepository.selectInByClave(Array.from(ids.procesoIds)),
      this.catNegocioRepository.selectInByClave(Array.from(ids.negocioIds)),
      this.admAseguradoraRepository.selectIn(Array.from(ids.aseguradoraIds)),
    ]);

    const result = proyectos.map((proy: any) => {
      return {
        _id: proy._id,
        pais: paises.find((_) => _.clave === proy.pais),
        ramo: ramos.find((_) => _.clave === proy.ramo),
        proceso: procesos.find((_) => _.clave === proy.proceso),
        negocio: negocios.find((_) => _.clave === proy.negocio),
        estatus: estatusGenerales.find((_) => _.clave === proy.estatus),
        aseguradora: aseguradoras.find((a) => proy.aseguradora.equals(a._id)),
        ceco: proy.ceco,
        subproceso: proy.subproceso,
      };
    });

    return DefaultResponse.sendOk('', result);
  }

  //FIXME: RMQServices_Administracion.PROYECTO.paginate
  async paginate(payload: {
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

    const dataPaginate = await this.admProyectoRepository.paginate(
      payload.paginateParams,
    );

    const claves = dataPaginate.docs.reduce(
      (value, proyecto) => {
        value.paisIds.add(proyecto.pais);
        value.ramoIds.add(proyecto.ramo);
        value.procesoIds.add(proyecto.proceso);
        value.negocioIds.add(proyecto.negocio);
        value.estatusIds.add(proyecto.estatus);
        value.aseguradoraIds.add(proyecto.aseguradora.toString());
        return value;
      },
      {
        paisIds: new Set<number>(),
        ramoIds: new Set<number>(),
        procesoIds: new Set<number>(),
        negocioIds: new Set<number>(),
        estatusIds: new Set<number>(),
        aseguradoraIds: new Set<string>(),
      },
    );

    const [paises, estatusGenerales, ramos, procesos, negocios, aseguradoras]: [
      any[],
      any[],
      any[],
      any[],
      any[],
      any[],
    ] = await Promise.all([
      this.catPaisRepository.selectInByClave(Array.from(claves.paisIds)),
      this.catEstatusGeneralRepository.selectInByClave(
        Array.from(claves.estatusIds),
      ),
      this.catRamoRepository.selectInByClave(Array.from(claves.ramoIds)),
      this.catProcesoRepository.selectInByClave(Array.from(claves.procesoIds)),
      this.catNegocioRepository.selectInByClave(Array.from(claves.negocioIds)),
      this.admAseguradoraRepository.selectIn(Array.from(claves.aseguradoraIds)),
    ]);

    dataPaginate.docs = dataPaginate.docs.map((element: any) => {
      return {
        _id: element._id,
        paisIcon: paises.find((_) => _.clave === element.pais)?.icon,
        paisDescripcion: paises.find((_) => _.clave === element.pais)
          ?.descripcion,
        ramo: element.ramo,
        ramoDescripcion: ramos.find((_) => _.clave === element.ramo)
          ?.descripcion,
        proceso: element.proceso,
        procesoDescripcion: procesos.find((_) => _.clave === element.proceso)
          ?.descripcion,
        negocio: element.negocio,
        negocioDescripcion: negocios.find((_) => _.clave === element.negocio)
          ?.descripcion,
        estatus: element.estatus,
        estatusDescripcion: estatusGenerales.find(
          (_) => _.clave === element.estatus,
        )?.descripcion,
        aseguradora: element.aseguradora,
        aseguradoraNombreComercial: aseguradoras.find((a) =>
          element.aseguradora.equals(a._id),
        )?.nombreComercial,
        ceco: element.ceco,
        activo: element.activo,
      };
    });

    return DefaultResponse.sendOk('', dataPaginate);
  }

  //FIXME: RMQServices_Administracion.PROYECTO.findAllByPais
  async findAllCodigosByPais(payload: {
    pais: number;
    lang: string;
  }): Promise<ResponseDto> {
    const proyectos = await this.admProyectoRepository.findAllCodigosByPais(
      payload.pais,
    );

    return DefaultResponse.sendOk('', proyectos);
  }

  //FIXME: RMQServices_Administracion.PROYECTO.findOne
  async findOne(payload: { id: string; lang: string }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const proyecto: any = await this.admProyectoRepository.findOne(payload.id);

    if (!proyecto)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.PROYECTO', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk('', proyecto);
  }

  //FIXME: PROYECTO_GET_CATALOGOS_PAIS
  async getCatalogosByPais(payload: any) {
    const [aseguradora, estatus, ramo, proceso, negocio]: [
      any,
      any,
      any,
      any,
      any,
    ] = await Promise.all([
      this.admAseguradoraRepository.selectByPais(Number(payload.id)),
      this.catEstatusGeneralRepository.select(),
      this.catRamoRepository.select(),
      this.catProcesoRepository.select(),
      this.catNegocioRepository.select(),
    ]);

    return DefaultResponse.sendOk('', {
      aseguradora: aseguradora,
      estatus: estatus?.data,
      ramo: ramo?.data,
      proceso: proceso?.data,
      negocio: negocio?.data,
    });
  }

  //FIXME: RMQServices_Administracion.PROYECTO.getCatalogosToCreate
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

    const catalogosResult = await this.catSharedService.proyecto_getCatalogos();

    if (!catalogosResult) return catalogosResult;

    const catalogos = { ...catalogosResult.data };
    catalogos.aseguradora = await this.admAseguradoraRepository.getAll();

    return DefaultResponse.sendOk('', catalogos);
  }

  //FIXME: RMQServices_Administracion.PROYECTO.selectIn
  async selectIn(ids: any) {
    return await this.admProyectoRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Administracion.PROYECTO.findOneToEdit)
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

    const proyecto = await this.admProyectoRepository.findOne(payload.id);

    if (!proyecto)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.PROYECTO', {
          lang: payload.lang,
        }),
      );

    const catalagosResult = await this.catSharedService.proyecto_getCatalogos();
    if (!catalagosResult) return catalagosResult;

    const catalogos = { ...catalagosResult.data };
    catalogos.aseguradora = await this.admAseguradoraRepository.getAll();

    const configuracion =
      await this.admProyectoConfiguracionRepository.findOneByProyecto(
        payload.id,
      );

    let clienteProyecto = '';
    let proyectoComercial = '';

    if (configuracion.length > 0) {
      clienteProyecto = configuracion[0].nombreCliente;
      proyectoComercial = configuracion[0].nombreComercial;
    }

    const data: any = {
      proyecto: {
        ceco: proyecto.ceco,
        aseguradora: proyecto.aseguradora,
        codigo: proyecto.codigo,
        portal: proyecto.portal ?? '',
        nombreCliente: clienteProyecto,
        nombreComercial: proyectoComercial,
        pais: catalogos?.paises.find((p: any) => p.clave === proyecto.pais)
          ?.clave,
        ramo: catalogos?.ramo.find((p: any) => p.clave === proyecto.ramo)
          ?.clave,
        proceso: catalogos?.proceso.find(
          (p: any) => p.clave === proyecto.proceso,
        )?.clave,
        negocio: catalogos?.negocio.find(
          (p: any) => p.clave === proyecto.negocio,
        )?.clave,
        estatus: catalogos?.estatus.find(
          (p: any) => p.clave === proyecto.estatus,
        )?.clave,
      },
      catalogos,
    };

    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Administracion.PROYECTO.update
  async update(payload: { id: any; data: AdmProyectoDto; lang: string }) {
    payload.data.aseguradora = new Types.ObjectId(payload.data.aseguradora);

    const proyecto = await this.admProyectoRepository.findOne(payload.id.id);

    const isModifyRegla =
      proyecto.pais === payload.data.pais &&
      proyecto.ramo === payload.data.ramo &&
      proyecto.proceso === payload.data.proceso &&
      proyecto.negocio === payload.data.negocio &&
      proyecto.aseguradora.toString() === payload.data.aseguradora.toString();
    proyecto.portal === payload.data.portal;

    if (!isModifyRegla) {
      const duplicado = await this.admProyectoRepository.exists(
        payload.data.pais,
        payload.data.ramo,
        payload.data.proceso,
        payload.data.negocio,
        payload.data.aseguradora.toString(),
        payload.data.portal,
      );

      if (duplicado) {
        return DefaultResponse.sendConflict(
          this.i18n.translate('administracion.VALIDATIONS.EXISTS.PROYECTO', {
            lang: payload.lang,
          }),
        );
      }
    }

    const updated = await this.admProyectoRepository.update(
      payload.id.id,
      payload.data,
    );

    const configuracion =
      await this.admProyectoConfiguracionRepository.findOneByProyecto(
        payload.id.id,
      );

    if (configuracion.length > 0) {
      await this.admProyectoConfiguracionRepository.update(
        configuracion[0]._id,
        {
          nombreCliente: payload.data.nombreCliente,
          nombreComercial: payload.data.nombreComercial,
          proyecto: updated._id,
        },
      );
    } else {
      await this.admProyectoConfiguracionRepository.create({
        nombreCliente: payload.data.nombreCliente ?? '',
        nombreComercial: payload.data.nombreComercial ?? '',
        proyecto: updated._id,
      });
    }

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }

  //CREATE MENU-PERFILES
  //CREATE PERMISO-PERFILES
  //TODO: Cambiar para hacerlo dinámicamente
  async createMenuYPermisos(
    proyecto: string,
    proceso: EProceso,
  ): Promise<void> {
    if (proceso === EProceso.KYC) {
      await this.createMenuYPermisosKyc(proyecto);
    }

    if (proceso === EProceso.FIANZAS)
      await this.createMenuYPermisosFianzas(proyecto);
  }

  async createMenuYPermisosKyc(proyecto: string): Promise<void> {
    const menus: Array<AdmMenuPerfilDto> = [
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 1,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Administración',
            orden: 1,
            menus: [
              {
                descripcion: 'Aseguradoras',
                path: '',
                icono: 'flaticon-layer',
                orden: 1,
                submenus: [
                  {
                    descripcion: 'Aseguradora',
                    path: '/administracion/aseguradoras',
                    orden: 1,
                  },
                  {
                    descripcion: 'Configuración',
                    path: '/administracion/configuracion-aseguradora',
                    orden: 2,
                  },
                ],
              },
              /* {
                descripcion: 'Proyectos',
                path: '/administracion/proyectos',
                icono: 'flaticon-contract',
                orden: 2,
                submenus: [],
              }, */
              {
                descripcion: 'Usuarios',
                path: '/administracion/usuarios',
                icono: 'flaticon-people',
                orden: 3,
                submenus: [],
              },
              {
                descripcion: 'Documentos',
                path: '',
                icono: 'flaticon-add',
                orden: 4,
                submenus: [
                  {
                    descripcion: 'Documento',
                    path: '/administracion/documentos',
                    orden: 1,
                  },
                  {
                    descripcion: 'Configuración',
                    path: '/administracion/configuracion-documental',
                    orden: 2,
                  },
                ],
              },
              {
                descripcion: 'Formato',
                path: '/administracion/formatos',
                icono: 'flaticon-contract',
                orden: 5,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 2,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Administración',
            orden: 1,
            menus: [
              {
                descripcion: 'Usuarios',
                path: '/administracion/usuarios',
                icono: 'flaticon-people',
                orden: 1,
                submenus: [],
              },
            ],
          },
          {
            descripcion: 'KYC',
            orden: 2,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 3,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Administración',
            orden: 1,
            menus: [
              {
                descripcion: 'Usuarios',
                path: '/administracion/usuarios',
                icono: 'flaticon-people',
                orden: 1,
                submenus: [],
              },
            ],
          },
          {
            descripcion: 'KYC',
            orden: 2,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 4,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'KYC',
            orden: 1,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-search',
                orden: 1,
                submenus: [],
              },
              {
                descripcion: 'Bandejas',
                path: '',
                icono: 'flaticon-chart-2',
                orden: 2,
                submenus: [
                  {
                    descripcion: 'Entradas',
                    path: '/bandejas/entradas',
                    orden: 1,
                  },
                  {
                    descripcion: 'Reprocesos',
                    path: '/bandejas/reprocesos',
                    orden: 2,
                  },
                  {
                    descripcion: 'Suspendidas',
                    path: '/bandejas/suspendidas',
                    orden: 3,
                  },
                  {
                    descripcion: 'Programadas',
                    path: '/bandejas/programadas',
                    orden: 4,
                  },
                ],
              },
              {
                descripcion: 'Folio',
                path: '',
                icono: 'flaticon-download-1',
                orden: 3,
                submenus: [
                  {
                    descripcion: 'Nuevo',
                    path: '/folio/nuevo',
                    orden: 1,
                  },
                  {
                    descripcion: 'Estatus carga',
                    path: '/folio/estatus-carga',
                    orden: 2,
                  },
                  {
                    descripcion: 'Carga documental masiva',
                    path: '/folio/carga-documental-masiva',
                    orden: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 5,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'KYC',
            orden: 1,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
              {
                descripcion: 'Bandejas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 2,
                submenus: [
                  {
                    descripcion: 'Entradas',
                    path: '/bandejas/entradas',
                    orden: 1,
                  },
                  {
                    descripcion: 'Reprocesos',
                    path: '/bandejas/reprocesos',
                    orden: 2,
                  },
                  {
                    descripcion: 'Suspendidas',
                    path: '/bandejas/suspendidas',
                    orden: 3,
                  },
                  {
                    descripcion: 'Programadas',
                    path: '/bandejas/programadas',
                    orden: 4,
                  },
                ],
              },
              {
                descripcion: 'Folio',
                path: '',
                icono: 'flaticon-download-1',
                orden: 3,
                submenus: [
                  {
                    descripcion: 'Nuevo',
                    path: '/folio/nuevo',
                    orden: 1,
                  },
                  {
                    descripcion: 'Estatus carga',
                    path: '/folio/estatus-carga',
                    orden: 2,
                  },
                  {
                    descripcion: 'Carga documental masiva',
                    path: '/folio/carga-documental-masiva',
                    orden: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 6,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'KYC',
            orden: 2,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 7,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'KYC',
            orden: 2,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 8,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Administración',
            orden: 1,
            menus: [
              {
                descripcion: 'Usuarios',
                path: '/administracion/usuarios',
                icono: 'flaticon-people',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
    ];

    const permisos: Array<AdmPermisoPerfilDto> = [
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 1,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          /* {
            descripcion: 'Proyectos',
            permiso: 'adm-proyectos',
          }, */
          {
            descripcion: 'Aseguradoras',
            permiso: 'adm-aseguradoras',
          },
          {
            descripcion: 'Usuarios',
            permiso: 'adm-usuarios',
          },
          {
            descripcion: 'Documentos',
            permiso: 'adm-documentos',
          },
          {
            descripcion: 'Configuración documental',
            permiso: 'adm-configuracion-documental',
          },
          {
            descripcion: 'Configuración aseguradora',
            permiso: 'adm-configuracion-aseguradora',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
          {
            descripcion: 'Formatos KYC',
            permiso: 'formatos',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 2,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Usuarios',
            permiso: 'adm-usuarios',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 3,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Usuarios',
            permiso: 'adm-usuarios',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 4,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
          {
            descripcion: 'Nuevo folio',
            permiso: 'nuevo-folio',
          },
          {
            descripcion: 'Solicitud',
            permiso: 'solicitud',
          },
          {
            descripcion: 'Carga documental',
            permiso: 'carga-documental',
          },
          {
            descripcion: 'Contacto aseguradora',
            permiso: 'contacto-aseguradora',
          },
          {
            descripcion: 'Bandeja entrada',
            permiso: 'bandeja-entrada',
          },
          {
            descripcion: 'Bandeja reproceso',
            permiso: 'bandeja-reproceso',
          },
          {
            descripcion: 'Bandeja suspendida',
            permiso: 'bandeja-suspendida',
          },
          {
            descripcion: 'Bandeja programada',
            permiso: 'bandeja-programada',
          },
          {
            descripcion: 'Contacto telefónico',
            permiso: 'contacto-telefonico',
          },
          {
            descripcion: 'Validación digital',
            permiso: 'validacion-digital',
          },
          {
            descripcion: 'Firma documental',
            permiso: 'firma-cliente',
          },
          {
            descripcion: 'Firma ejecutivo',
            permiso: 'firma-ejecutivo',
          },
          {
            descripcion: 'Confirmacion de entrega',
            permiso: 'confirmacion-entrega',
          },
          {
            descripcion: 'Validacion de firmas',
            permiso: 'validacion-firmas',
          },
          {
            descripcion: 'Carga documental masiva',
            permiso: 'carga-documental-masiva',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 5,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
          {
            descripcion: 'Nuevo folio',
            permiso: 'nuevo-folio',
          },
          {
            descripcion: 'Solicitud',
            permiso: 'solicitud',
          },
          {
            descripcion: 'Carga documental',
            permiso: 'carga-documental',
          },
          {
            descripcion: 'Validación digital',
            permiso: 'validacion-digital',
          },
          {
            descripcion: 'Cotejo',
            permiso: 'cotejo',
          },
          {
            descripcion: 'Firma documental',
            permiso: 'firma-cliente',
          },
          {
            descripcion: 'Firma ejecutivo',
            permiso: 'firma-ejecutivo',
          },
          {
            descripcion: 'Validacion de firmas',
            permiso: 'validacion-firmas',
          },
          {
            descripcion: 'Confirmacion de entrega',
            permiso: 'confirmacion-entrega',
          },
          {
            descripcion: 'Contacto telefonico',
            permiso: 'contacto-telefonico',
          },
          {
            descripcion: 'Bandeja entrada',
            permiso: 'bandeja-entrada',
          },
          {
            descripcion: 'Bandeja reproceso',
            permiso: 'bandeja-reproceso',
          },
          {
            descripcion: 'Bandeja suspendida',
            permiso: 'bandeja-suspendida',
          },
          {
            descripcion: 'Bandeja programada',
            permiso: 'bandeja-programada',
          },
          {
            descripcion: 'Contacto aseguradora',
            permiso: 'contacto-aseguradora',
          },
          {
            descripcion: 'Carga documental masiva',
            permiso: 'carga-documental-masiva',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 6,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 7,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 8,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
          {
            descripcion: 'Usuarios',
            permiso: 'adm-usuarios',
          },
        ],
      },
    ];

    await this.admMenuPerfilRepository.createMany(menus);
    await this.admPermisoPerfilRepository.createMany(permisos);
  }

  async createMenuYPermisosFianzas(proyecto: string): Promise<void> {
    const menus: Array<AdmMenuPerfilDto> = [
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 1,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Administración',
            orden: 1,
            menus: [
              {
                descripcion: 'Aseguradoras',
                path: '',
                icono: 'flaticon-layer',
                orden: 1,
                submenus: [
                  {
                    descripcion: 'Aseguradora',
                    path: '/administracion/aseguradoras',
                    orden: 1,
                  },
                  {
                    descripcion: 'Configuración',
                    path: '/administracion/configuracion-aseguradora',
                    orden: 2,
                  },
                ],
              },
              /* {
                descripcion: 'Proyectos',
                path: '/administracion/proyectos',
                icono: 'flaticon-contract',
                orden: 2,
                submenus: [],
              }, */
              {
                descripcion: 'Usuarios',
                path: '/administracion/usuarios',
                icono: 'flaticon-people',
                orden: 3,
                submenus: [],
              },
              {
                descripcion: 'Documentos',
                path: '',
                icono: 'flaticon-add',
                orden: 4,
                submenus: [
                  {
                    descripcion: 'Documento',
                    path: '/administracion/documentos',
                    orden: 1,
                  },
                  {
                    descripcion: 'Configuración',
                    path: '/administracion/configuracion-documental',
                    orden: 2,
                  },
                ],
              },
              {
                descripcion: 'Cotejo',
                path: '',
                icono: 'flaticon-settings',
                orden: 5,
                submenus: [
                  {
                    descripcion: 'Firma ejecutivo',
                    path: '/administracion/configurador-firma-contejo',
                    orden: 1,
                  },
                ],
              },
              /* {
                descripcion: 'Formato',
                path: '/fianzas/administracion/formatos',
                icono: 'flaticon-contract',
                orden: 5,
                submenus: [],
              }, */
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 2,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Administración',
            orden: 1,
            menus: [
              {
                descripcion: 'Usuarios',
                path: '/administracion/usuarios',
                icono: 'flaticon-people',
                orden: 1,
                submenus: [],
              },
            ],
          },
          {
            descripcion: 'Fianzas',
            orden: 2,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 3,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Administración',
            orden: 1,
            menus: [
              {
                descripcion: 'Usuarios',
                path: '/administracion/usuarios',
                icono: 'flaticon-people',
                orden: 1,
                submenus: [],
              },
            ],
          },
          {
            descripcion: 'Fianzas',
            orden: 2,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 4,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Fianzas',
            orden: 1,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-search',
                orden: 1,
                submenus: [],
              },
              {
                descripcion: 'Bandejas',
                path: '',
                icono: 'flaticon-chart-2',
                orden: 2,
                submenus: [
                  {
                    descripcion: 'Entradas',
                    path: '/bandejas/entradas',
                    orden: 1,
                  },
                  {
                    descripcion: 'Reprocesos',
                    path: '/bandejas/reprocesos',
                    orden: 2,
                  },
                  {
                    descripcion: 'Suspendidas',
                    path: '/bandejas/suspendidas',
                    orden: 3,
                  },
                  {
                    descripcion: 'Programadas',
                    path: '/bandejas/programadas',
                    orden: 4,
                  },
                ],
              },
              {
                descripcion: 'Folio',
                path: '',
                icono: 'flaticon-download-1',
                orden: 3,
                submenus: [
                  {
                    descripcion: 'Nuevo',
                    path: '/folio/nuevo',
                    orden: 1,
                  },
                  {
                    descripcion: 'Estatus carga',
                    path: '/folio/estatus-carga',
                    orden: 2,
                  },
                  {
                    descripcion: 'Carga documental masiva',
                    path: '/folio/carga-documental-masiva',
                    orden: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 5,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Fianzas',
            orden: 1,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
              {
                descripcion: 'Bandejas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 2,
                submenus: [
                  {
                    descripcion: 'Entradas',
                    path: '/bandejas/entradas',
                    orden: 1,
                  },
                  {
                    descripcion: 'Reprocesos',
                    path: '/bandejas/reprocesos',
                    orden: 2,
                  },
                  {
                    descripcion: 'Suspendidas',
                    path: '/bandejas/suspendidas',
                    orden: 3,
                  },
                  {
                    descripcion: 'Programadas',
                    path: '/bandejas/programadas',
                    orden: 4,
                  },
                ],
              },
              {
                descripcion: 'Folio',
                path: '',
                icono: 'flaticon-download-1',
                orden: 3,
                submenus: [
                  {
                    descripcion: 'Nuevo',
                    path: '/folio/nuevo',
                    orden: 1,
                  },
                  {
                    descripcion: 'Estatus carga',
                    path: '/folio/estatus-carga',
                    orden: 2,
                  },
                  {
                    descripcion: 'Carga documental masiva',
                    path: '/folio/carga-documental-masiva',
                    orden: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 6,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Fianzas',
            orden: 2,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 7,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Fianzas',
            orden: 2,
            menus: [
              {
                descripcion: 'Búsquedas',
                path: '/busquedas',
                icono: 'flaticon-file-2',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 8,
        pathInicial: '/dashboard',
        modulos: [
          {
            descripcion: 'Administración',
            orden: 1,
            menus: [
              {
                descripcion: 'Usuarios',
                path: '/administracion/usuarios',
                icono: 'flaticon-people',
                orden: 1,
                submenus: [],
              },
            ],
          },
        ],
      },
    ];

    const permisos: Array<AdmPermisoPerfilDto> = [
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 1,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          /* {
            descripcion: 'Proyectos',
            permiso: 'adm-proyectos',
          }, */
          {
            descripcion: 'Aseguradoras',
            permiso: 'adm-aseguradoras',
          },
          {
            descripcion: 'Usuarios',
            permiso: 'adm-usuarios',
          },
          {
            descripcion: 'Documentos',
            permiso: 'adm-documentos',
          },
          {
            descripcion: 'Configuración documental',
            permiso: 'adm-configuracion-documental',
          },
          {
            descripcion: 'Configuración aseguradora',
            permiso: 'adm-configuracion-aseguradora',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
          //TODO
          {
            descripcion: 'Formatos KYC',
            permiso: 'formatos',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 2,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Usuarios',
            permiso: 'adm-usuarios',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 3,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Usuarios',
            permiso: 'adm-usuarios',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 4,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
          {
            descripcion: 'Bandeja entrada',
            permiso: 'bandeja-entrada',
          },
          {
            descripcion: 'Bandeja reproceso',
            permiso: 'bandeja-reproceso',
          },
          {
            descripcion: 'Bandeja suspendida',
            permiso: 'bandeja-suspendida',
          },
          {
            descripcion: 'Bandeja programada',
            permiso: 'bandeja-programada',
          },
          {
            descripcion: 'Nuevo folio',
            permiso: 'nuevo-folio',
          },
          {
            descripcion: 'Solicitud',
            permiso: 'solicitud',
          },
          {
            descripcion: 'Carga documental',
            permiso: 'carga-documental',
          },
          {
            descripcion: 'Validación digital',
            permiso: 'validacion-digital',
          },
          {
            descripcion: 'Generación de formatos',
            permiso: 'generacion-formatos',
          },
          {
            descripcion: 'Firma documental',
            permiso: 'firma-documental',
          },
          {
            descripcion: 'Validación de firmas',
            permiso: 'validacion-firma',
          },
          {
            descripcion: 'Validación afianzadora',
            permiso: 'validacion-afianzadora',
          },
          {
            descripcion: 'Recolección de físicos',
            permiso: 'recoleccion-fisicos',
          },
          {
            descripcion: 'Validación de originales',
            permiso: 'validacion-originales',
          },
          {
            descripcion: 'Confirmación de entrega',
            permiso: 'confirmacion-entrega',
          },
          {
            descripcion: 'Contacto telefónico',
            permiso: 'contacto-telefonico',
          },
          {
            descripcion: 'Contacto aseguradora',
            permiso: 'contacto-aseguradora',
          },
          {
            descripcion: 'Carga documental masiva',
            permiso: 'carga-documental-masiva',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 5,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
          {
            descripcion: 'Bandeja entrada',
            permiso: 'bandeja-entrada',
          },
          {
            descripcion: 'Bandeja reproceso',
            permiso: 'bandeja-reproceso',
          },
          {
            descripcion: 'Bandeja suspendida',
            permiso: 'bandeja-suspendida',
          },
          {
            descripcion: 'Bandeja programada',
            permiso: 'bandeja-programada',
          },
          {
            descripcion: 'Nuevo folio',
            permiso: 'nuevo-folio',
          },
          {
            descripcion: 'Solicitud',
            permiso: 'solicitud',
          },
          {
            descripcion: 'Carga documental',
            permiso: 'carga-documental',
          },
          {
            descripcion: 'Validación digital',
            permiso: 'validacion-digital',
          },
          {
            descripcion: 'Generación de formatos',
            permiso: 'generacion-formatos',
          },
          {
            descripcion: 'Firma documental',
            permiso: 'firma-documental',
          },
          {
            descripcion: 'Validación de firmas',
            permiso: 'validacion-firma',
          },
          {
            descripcion: 'Validación afianzadora',
            permiso: 'validacion-afianzadora',
          },
          {
            descripcion: 'Recolección de físicos',
            permiso: 'recoleccion-fisicos',
          },
          {
            descripcion: 'Validación de originales',
            permiso: 'validacion-originales',
          },
          {
            descripcion: 'Confirmación de entrega',
            permiso: 'confirmacion-entrega',
          },
          {
            descripcion: 'Contacto telefónico',
            permiso: 'contacto-telefonico',
          },
          {
            descripcion: 'Contacto aseguradora',
            permiso: 'contacto-aseguradora',
          },
          {
            descripcion: 'Carga documental masiva',
            permiso: 'carga-documental-masiva',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 6,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 7,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
        ],
      },
      {
        proyecto: new Types.ObjectId(proyecto),
        perfil: 8,
        permisos: [
          {
            descripcion: 'Dashboard',
            permiso: 'dashboard',
          },
          {
            descripcion: 'Búsquedas',
            permiso: 'busquedas',
          },
          {
            descripcion: 'Usuarios',
            permiso: 'adm-usuarios',
          },
        ],
      },
    ];

    await this.admMenuPerfilRepository.createMany(menus);
    await this.admPermisoPerfilRepository.createMany(permisos);
  }
}
