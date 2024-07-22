import { Controller, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { Types } from 'mongoose';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as path from 'path';
import { EstatusBitacoraConsts } from 'src/app/common/consts/core/estatus-bitacora.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { ECatalogo } from 'src/app/common/enum/catalogo.enum';
import { ETipoCarga } from 'src/app/common/enum/catalogo/tipo-carga.enum';
import { EKycActividad } from 'src/app/common/enum/kyc/kyc.actividad.enum';
import { IMailOptions } from 'src/app/common/interfaces/mail.dto';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { NotificationConsts } from 'src/app/services/helpers/consts/notification.const';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TimeZoneMoment } from 'src/app/utils/moment/time.zone.moment';
import { LayoutValidator } from 'src/app/utils/validators/layout.validator';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { AdmConfiguracionAseguradoraService } from 'src/modules/administracion/domain/services/adm.configuracion-aseguradora.service';
import { AdmConfiguracionDocumentalService } from 'src/modules/administracion/domain/services/adm.configuracion-documental.service';
import { AdmProyectoService } from 'src/modules/administracion/domain/services/adm.proyecto.service';
import { AdmUsuarioService } from 'src/modules/administracion/domain/services/adm.usuario.service';
import { AdmAseguradoraRepository } from 'src/modules/administracion/persistence/repository/adm.aseguradora.repository';
import { AdmProyectoFolioRepository } from 'src/modules/administracion/persistence/repository/adm.proyecto-folio.repository';
import { BitActividadService } from 'src/modules/bitacora/domain/services/bit.actividad.service';
import { BitNotificacionService } from 'src/modules/bitacora/domain/services/bit.notificacion.service';
import { CatGiroRepository } from 'src/modules/catalogo/persistence/repository/cat.giro.repository';
import { CatOficinaRepository } from 'src/modules/catalogo/persistence/repository/cat.oficina.repository';
import { CatPaisRepository } from 'src/modules/catalogo/persistence/repository/cat.pais.repository';
import { CatPerfilRepository } from 'src/modules/catalogo/persistence/repository/cat.perfil.repository';
import { CatRiesgoRepository } from 'src/modules/catalogo/persistence/repository/cat.riesgo.repository';
import { CatTipoContactoRepository } from 'src/modules/catalogo/persistence/repository/cat.tipo-contacto.repository';
import { CatTipoMovimientoRepository } from 'src/modules/catalogo/persistence/repository/cat.tipo-movimiento.repository';
import { CatTipoPersonaRepository } from 'src/modules/catalogo/persistence/repository/cat.tipo-persona.repository';
import { CatUnidadRepository } from 'src/modules/catalogo/persistence/repository/cat.unidad.repository';
import { WorkflowService } from 'src/modules/workflow/domain/services/workflow.service';
import { CoreFolioLayoutRepository } from '../../persistence/repository/core.folio-layout.repository';
import { CoreFolioRepository } from '../../persistence/repository/core.folio.repository';
import { CoreInformacionContactoRepository } from '../../persistence/repository/core.informacion-contacto.repository';
import { CoreInformacionEjecutivoRepository } from '../../persistence/repository/core.informacion-ejecutivo.repository';
import { CorePolizaRepository } from '../../persistence/repository/core.poliza.repository';
import { CoreTelefonoContactoRepository } from '../../persistence/repository/core.telefono-contacto.repository';
import { CoreTitularRepository } from '../../persistence/repository/core.titular.repository';
import {
  CoreFolioLayoutCreateHeaderBodyDto,
  CoreFolioLayoutDetailBodyColumnDto,
  CoreFolioLayoutDetailBodyDto,
  CoreFolioLayoutDetailColumnDto,
  CoreFolioLayoutDetailRowDto,
  CoreFolioLayoutUpdateHeaderBodyDto,
  ELayoutCatalogoTypeDto,
  ILayoutCatalogoResponseDto,
} from '../helpers/dto/core.folio-layout.dto';
import { CoreFolioDto } from '../helpers/dto/core.folio.dto';
import { CoreInformacionContactoDto } from '../helpers/dto/core.informacion-contacto.dto';
import { CoreInformacionEjecutivoDto } from '../helpers/dto/core.informacion-ejecutivo.dto';
import { CorePolizaDto } from '../helpers/dto/core.poliza.dto';
import { CoreTelefonoContactoDto } from '../helpers/dto/core.telefono-contacto.dto';
import {
  ELayoutColumnType,
  ELayoutColumns,
} from '../helpers/enum/core.layout-column-type.enum';
import { CoreComentarioService } from './core.comentario.service';
import { EBitNotificacionType } from 'src/app/common/enum/notificaciones.enum';
import { EComentario } from '../helpers/enum/core.comentario';
import {FolioReportType} from "../helpers/interfaces/folio-report-type.interface";
import {CoreFolioReportService} from "./core.folio-report.service";

@Controller()
export class CoreFolioLayoutService {
  private readonly _logger = new Logger(CoreFolioLayoutService.name);

  constructor(
    private i18nService: I18nService<I18nTranslations>,
    private readonly catGiroRepository: CatGiroRepository,
    private readonly catOficinaRepository: CatOficinaRepository,
    private readonly catPaisRepository: CatPaisRepository,
    private readonly catPerfilRepository: CatPerfilRepository,
    private readonly catRiesgoRepository: CatRiesgoRepository,
    private readonly catTipoContactoRepository: CatTipoContactoRepository,
    private readonly catTipoMovimientoRepository: CatTipoMovimientoRepository,
    private readonly catTipoPersonaRepository: CatTipoPersonaRepository,
    private readonly catUnidadRepository: CatUnidadRepository,
    private readonly coreComentarioService: CoreComentarioService,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly coreFolioLayoutRepository: CoreFolioLayoutRepository,
    private readonly coreInformacionContactoRepository: CoreInformacionContactoRepository,
    private readonly coreInformacionEjecutivoRepository: CoreInformacionEjecutivoRepository,
    private readonly corePolizaRepository: CorePolizaRepository,
    private readonly coreTelefonoContactoRepository: CoreTelefonoContactoRepository,
    private readonly coreTitularRepository: CoreTitularRepository,
    private readonly admAseguradoraRepository: AdmAseguradoraRepository,
    private readonly admUsuarioService: AdmUsuarioService,
    private readonly admConfiguracionAseguradoraService: AdmConfiguracionAseguradoraService,
    private readonly admConfiguracionDocumentalService: AdmConfiguracionDocumentalService,
    private readonly admProyectoService: AdmProyectoService,
    private readonly admProyectoFolioRepository: AdmProyectoFolioRepository,
    private readonly bitActividadService: BitActividadService,
    private readonly bitNotificacionService: BitNotificacionService,
    private readonly workflowService: WorkflowService,
    private readonly coreFolioReportService:CoreFolioReportService,

  ) { }

  async createLayoutHeader(
    body: CoreFolioLayoutCreateHeaderBodyDto,
    session: SessionTokenDto,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const count = await this.coreFolioLayoutRepository.getCountByUser(
      session.usuario,
    );

    const fechaFormat = moment(body.fechaInicioCarga).format('DDMMYYYY');
    const filename = `CargaMasiva_${fechaFormat}_${count + 1}${path
      .extname(body.filename)
      .toLocaleLowerCase()}`;

    const header: any = await this.coreFolioLayoutRepository.createLayoutHeader(
      {
        usuario: new Types.ObjectId(session.usuario),
        totalRows: body.totalRows,
        filename,
        contentType: body.contentType,
        originalFilename: body.originalFilename,
        archivoSize: body.archivoSize,
        fechaInicioCarga: body.fechaInicioCarga,
      },
    );

    const perfil = await this.catPerfilRepository.findOne(session.rol);

    return DefaultResponse.sendOk('', {
      layoutHeaderId: header._id,
      filename,
      perfil: perfil.clave,
    });
  }

  async updateLayoutHeader(payload: {
    body: CoreFolioLayoutUpdateHeaderBodyDto;
    session: SessionTokenDto;
    bearer: string | undefined;
    i18nContext: I18nContext;
  }): Promise<ResponseDto> {
    const { body, session, bearer, i18nContext } = payload;

    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18nService.translate('server.STATUS_CODE.401', {
          lang: i18nContext.lang,
        }),
      );

    const data = await this.coreFolioLayoutRepository.updateLayoutHeader(
      body._id,
      !body.correcto,
    );

    const usuarioResult = await this.admUsuarioService.findOne({
      id: session.usuario,
      lang: i18nContext.lang,
    });

    if (!usuarioResult.success) return usuarioResult;
    const usuario = usuarioResult.data;

    const proyectoResult = await this.admProyectoService.findOne({
      id: session.proyecto,
      lang: i18nContext.lang,
    });

    if (!proyectoResult.success) return proyectoResult;

    const pais = await this.catPaisRepository.findOneByClave(
      proyectoResult.data.pais,
    );

    const result = TimeZoneMoment.convertDateZoneTime(
      moment(data.fechaInicioCarga),
      pais.zonaHoraria,
    );

    const nombreUsuario = `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido ?? ''
      }`.trim();

    const bodyNotification = {
      mailOptions: <IMailOptions>{
        to: [usuario.correoElectronico],
      },
      nombreUsuario,
      fechaInicioCarga: result.format('DD-MM-YYYY HH:mm:ss'),
      filename: data.filename ?? 'unknown',
      lang: i18nContext.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18nContext,
      EBitNotificacionType.MARSH_NOTIFICACION_ESTATUS_CARGA_MASIVA,
      session,
      bodyNotification,
    );

    return DefaultResponse.sendOk('', data);
  }

  async uploadLayoutDetails(payload: {
    body: CoreFolioLayoutDetailBodyDto;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    const layoutRows = await this.procesarLayoutDetails(payload);

    return DefaultResponse.sendOk('', {
      layoutWithErrors: layoutRows.some((l) => !l.success),
    });
  }

  async procesarLayoutDetails(payload: any) {
    const { header, block, data, columns, rowIndex } = payload.body;

    let rowIndexLayout: number = rowIndex;
    let layoutRows: CoreFolioLayoutDetailRowDto[] = [];

    for (let i = 0; i < data.length; i++) {
      const values: any[] = Object.values(data[i]);

      const dataColumns: Array<CoreFolioLayoutDetailColumnDto> = [];
      const clavesCatalogos: Array<ILayoutCatalogoResponseDto> = [];

      for (let j = 0; j < values.length; j++) {
        let message: string | null = null;

        if (columns[j].type === ELayoutColumnType.DATE_WITH_FORMAT) {
          const date = new Date(values[j]);            
          if (typeof values[j] !== 'number' && !isNaN(Date.parse(values[j]))) {
            values[j] = date;
          } 
        }

        if (columns[j].type === ELayoutColumnType.CATALOG) {
          const resultCatalogNotify: ILayoutCatalogoResponseDto =
            await this.createNotificationCatalog(values[j], columns[j]);

          if (resultCatalogNotify.type === ELayoutCatalogoTypeDto.NONE)
            message = resultCatalogNotify.message;
          else clavesCatalogos.push(resultCatalogNotify);
        } else
          message = LayoutValidator.createNotification(values[j], columns[j]);

        dataColumns.push({
          columnIndex: j,
          columnName: columns[j].name,
          value: values[j] ? values[j].toString() : undefined,
          success: message ? false : true,
          type: columns[j].type,
          message: message ? message : undefined,
        });
      }

      let newRow: CoreFolioLayoutDetailRowDto = {
        header: new Types.ObjectId(header),
        block,
        rowIndex: rowIndexLayout,
        columns: dataColumns,
        message: dataColumns.every((c) => c.success)
          ? 'Folio exitoso.'
          : 'Folio con errores.',
        success: dataColumns.every((c) => c.success),
      };

      if (newRow.success) {
        newRow = await this.validateReglasNegocio(
          newRow,
          clavesCatalogos,
          values,
          payload,
        );
      }

      layoutRows.push(newRow);

      rowIndexLayout += 1;
    }

    await this.coreFolioLayoutRepository.createLayoutRow(layoutRows);

    return layoutRows;
  }

  async validateReglasNegocio(
    newRow: CoreFolioLayoutDetailRowDto,
    clavesCatalogos: Array<ILayoutCatalogoResponseDto>,
    values: Array<any>,
    payload: any,
  ): Promise<CoreFolioLayoutDetailRowDto> {
    const { session } = payload;
    // RN: Validar que la oficina pertenezca al páis de la aseguradora
    const containsOficina = await this.validateAseguradoraContainsOficina(
      clavesCatalogos.find(
        (c) => c.type === ELayoutCatalogoTypeDto.ASEGURADORA,
      )!._id,
      clavesCatalogos.find((c) => c.type === ELayoutCatalogoTypeDto.OFICINA)!
        .clave,
    );

    if (!containsOficina) {
      return {
        ...newRow,
        success: false,
        message: `La aseguradora '${values[ELayoutColumns.L_ASEGURADORA]
          }' no tiene una oficina '${values[ELayoutColumns.M_OFICINA]
          }' registrada.`,
      };
    }

    // RN: Validar que tenga registrado una configuración documental
    const idAseguradora = clavesCatalogos.find(
      (c) => c.type === ELayoutCatalogoTypeDto.ASEGURADORA,
    )._id;

    const hasConfiguracionDocumental =
      await this.validateHasConfigurationDocumental(
        payload.session.proyecto,
        idAseguradora,
        clavesCatalogos.find(
          (c) => c.type === ELayoutCatalogoTypeDto.TIPO_PERSONA,
        )!.clave,
      );

    if (!hasConfiguracionDocumental) {
      return {
        ...newRow,
        success: false,
        message: `La aseguradora '${values[ELayoutColumns.L_ASEGURADORA]
          }' no tiene configuración documental para el tipo persona '${values[ELayoutColumns.P_TIPO_PERSONA]
          }'.`,
      };
    }

    // RN: Validar que tenga al menos un correo en configuración aseguradora para las notificaciones
    const hasConfiguracionAseguradora =
      await this.validateHasConfigurationAseguradora(
        session.proyecto,
        idAseguradora,
      );

    if (!hasConfiguracionAseguradora) {
      return {
        ...newRow,
        success: false,
        message: `La aseguradora '${values[ELayoutColumns.L_ASEGURADORA]
          }' no tiene registrado ningún correo electrónico en su configuración.`,
      };
    }

    // RN: Validar que no exista el folio
    const existsFolio = await this.validateExistsFolio(
      values[ELayoutColumns.A_CLIENTE],
      values[ELayoutColumns.F_DES_UNIDAD],
      values[ELayoutColumns.G_NOM_RIESGO],
      values[ELayoutColumns.L_ASEGURADORA],
      values[ELayoutColumns.N_FECHA_VIGENCIA],
      clavesCatalogos,
    );

    if (existsFolio) {
      return {
        ...newRow,
        success: false,
        message: `El folio ya se encuentra registrado en el sistema.`,
      };
    }

    // Creamos el folio porque pasó todas las validaciones
    await this.createFolio(
      values,
      clavesCatalogos,
      payload.session,
      payload.lang,
    );

    return newRow;
  }

  //FIXME: RMQServices_Core.FOLIO.paginateLayoutsByUser
  async paginateLayoutsByUser(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    const { session, paginateParams } = payload;
    const paginate = await this.coreFolioLayoutRepository.paginateAll(
      session.usuario,
      paginateParams,
    );

    const proyectoResult = await this.admProyectoService.findOne({
      id: session.proyecto,
      lang: payload.lang,
    });

    if (!proyectoResult) return proyectoResult;

    const pais = await this.catPaisRepository.findOneByClave(
      proyectoResult.data.pais,
    );

    const docs = paginate.docs.map((d: any) => {
      const result = TimeZoneMoment.convertDateZoneTime(
        moment(d.fechaInicioCarga),
        pais.zonaHoraria,
      );

      //return { ...d, fechaInicioCarga: result.format('DD-MM-YYYY HH:mm:ss') };

      const dateStr = result.format('DD-MM-YYYY HH:mm:ss');
      const fechaInicioCarga = moment(dateStr, "DD-MM-YYYY HH:mm:ss'").toDate();

      return {
        _id: d._id,
        filename: d.filename,
        totalRows: d.totalRows,
        archivoSize: d.archivoSize,
        procesado: d.procesado,
        correcto: d.correcto,
        fechaInicioCarga,
        fechaFinCarga: d.fechaFinCarga,
      };
    });

    paginate.docs = docs;

    return DefaultResponse.sendOk('', paginate);
  }

  //FIXME: RMQServices_Core.FOLIO.findOneLayoutByHeader
  async findOneByHeader(payload: {
    header: string;
    paginateParams: IPaginateParams;
    lang: string;
  }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.header))
      return DefaultResponse.sendBadRequest(
        this.i18nService.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const layoutHeader: any = await this.coreFolioLayoutRepository.findHeader(
      payload.header,
    );

    if (!layoutHeader)
      return DefaultResponse.sendNotFound(
        this.i18nService.translate('core.VALIDATIONS.NOT_FOUND.FOLIO_LAYOUT', {
          lang: payload.lang,
        }),
      );

    const layoutDetailsPaginate =
      await this.coreFolioLayoutRepository.findDetailsByHeader(
        new Types.ObjectId(layoutHeader._id),
        payload.paginateParams,
      );

    layoutDetailsPaginate.docs = layoutDetailsPaginate.docs.map(
      (record: any) => {
        const filter = record.columns.filter((col: any) => !col.success);
        return { ...record.toObject(), columns: filter };
      },
    );

    const header: any = {
      _id: layoutHeader._id,
      filename: layoutHeader.filename,
      correcto: layoutHeader.correcto,
      procesado: layoutHeader.procesado,
      archivoSize: layoutHeader.archivoSize,
      totalRows: layoutHeader.totalRows,
      fechaInicioCarga: layoutHeader.fechaInicioCarga,
      fechaFinCarga: layoutHeader.fechaFinCarga,
    };

    return DefaultResponse.sendOk('', {
      header,
      details: layoutDetailsPaginate,
    });
  }

  /* PRIVATE */

  async createNotificationCatalog(
    input: any,
    column: CoreFolioLayoutDetailBodyColumnDto,
  ): Promise<ILayoutCatalogoResponseDto> {
    const content = LayoutValidator.getContent(input);

    if (column?.required && !LayoutValidator.hasData(content))
      return {
        type: ELayoutCatalogoTypeDto.NONE,
        message: `El campo ${column.name.toUpperCase()} no tiene información`,
      };

    const messageEnd: string = 'no se encuentra registrado en el sistema';

    switch (column.catalog) {
      case ECatalogo.TIPO_CONTACTO: {
        const tipoContacto: any =
          await this.catTipoContactoRepository.findOneByDescription(content);
        return tipoContacto
          ? {
            type: ELayoutCatalogoTypeDto.TIPO_CONTACTO,
            message: null,
            clave: tipoContacto.clave,
          }
          : {
            type: ELayoutCatalogoTypeDto.NONE,
            message: `El tipo de contacto '${content}' ${messageEnd}`,
          };
      }

      case ECatalogo.ASEGURADORA: {
        const aseguradora: any =
          await this.admAseguradoraRepository.existsOneByNombreComercial(
            content,
          );

        return aseguradora
          ? {
            type: ELayoutCatalogoTypeDto.ASEGURADORA,
            message: null,
            _id: aseguradora._id,
          }
          : {
            type: ELayoutCatalogoTypeDto.NONE,
            message: `La aseguradora '${content}' ${messageEnd}`,
          };
      }

      case ECatalogo.TIPO_MOVIMIENTO: {
        const tipoMovimiento: any =
          await this.catTipoMovimientoRepository.findOneByDescripcion(content);

        return tipoMovimiento
          ? {
            type: ELayoutCatalogoTypeDto.TIPO_MOVIMIENTO,
            message: null,
            clave: tipoMovimiento.clave,
          }
          : {
            type: ELayoutCatalogoTypeDto.NONE,
            message: `El tipo movimiento '${content}' ${messageEnd}`,
          };
      }

      case ECatalogo.TIPO_PERSONA: {
        const tipoPersona: any =
          await this.catTipoPersonaRepository.findOneByDescription(content);

        return tipoPersona
          ? {
            type: ELayoutCatalogoTypeDto.TIPO_PERSONA,
            message: null,
            clave: tipoPersona.clave,
          }
          : {
            type: ELayoutCatalogoTypeDto.NONE,
            message: `El tipo persona '${content}' ${messageEnd}`,
          };
      }

      case ECatalogo.GIRO: {
        const giro: any = await this.catGiroRepository.findOneByDescripcion(
          content,
        );

        return giro
          ? {
            type: ELayoutCatalogoTypeDto.GIRO,
            message: null,
            clave: giro.clave,
          }
          : {
            type: ELayoutCatalogoTypeDto.NONE,
            message: `El giro '${content}' ${messageEnd}`,
          };
      }

      case ECatalogo.RIESGO: {
        const riesgo: any = await this.catRiesgoRepository.findOneByDescription(
          content,
        );

        return riesgo
          ? {
            type: ELayoutCatalogoTypeDto.RIESGO,
            message: null,
            clave: riesgo.clave,
          }
          : {
            type: ELayoutCatalogoTypeDto.NONE,
            message: `El riesgo '${content}' ${messageEnd}`,
          };
      }

      case ECatalogo.UNIDAD: {
        const unidad: any = await this.catUnidadRepository.findOneByDescription(
          content,
        );

        return unidad
          ? {
            type: ELayoutCatalogoTypeDto.UNIDAD,
            message: null,
            clave: unidad.clave,
          }
          : {
            type: ELayoutCatalogoTypeDto.NONE,
            message: `La unidad '${content}' ${messageEnd}`,
          };
      }

      case ECatalogo.OFICINA: {
        const oficina = await this.catOficinaRepository.findOneByDescripcion(
          content,
        );

        return oficina
          ? {
            type: ELayoutCatalogoTypeDto.OFICINA,
            message: null,
            clave: oficina.clave,
          }
          : {
            type: ELayoutCatalogoTypeDto.NONE,
            message: `La oficina '${content}' ${messageEnd}`,
          };
      }
    }

    return null;
  }

  async createFolio(
    values: any[],
    clavesCatalogos: Array<ILayoutCatalogoResponseDto>,
    session: SessionTokenDto,
    lang: string,
  ): Promise<void> {
    this._logger.verbose('::: Creating new Folio');

    const proyectoFolio: any =
      await this.admProyectoFolioRepository.findOneByProyecto(session.proyecto);

    let titular: any = await this.coreTitularRepository.findOneByNumeroCliente(
      values[ELayoutColumns.A_CLIENTE],
    );

    if (!titular)
      titular = await this.coreTitularRepository.create({
        numeroCliente: values[ELayoutColumns.A_CLIENTE],
        proyecto: new Types.ObjectId(session.proyecto),
        nombre: values[ELayoutColumns.B_NOM_CLIENTE],
        tipoPersona: clavesCatalogos.find(
          (c) => c.type === ELayoutCatalogoTypeDto.TIPO_PERSONA,
        ).clave,
      });

    const tipoMovimiento = clavesCatalogos.find(
      (c) => c.type === ELayoutCatalogoTypeDto.TIPO_MOVIMIENTO,
    ).clave;

    const giro = clavesCatalogos.find(
      (c) => c.type === ELayoutCatalogoTypeDto.GIRO,
    ).clave;

    const oficina = clavesCatalogos.find(
      (c) => c.type === ELayoutCatalogoTypeDto.OFICINA,
    ).clave;

    let ejecutivo: any =
      await this.coreInformacionEjecutivoRepository.findOneByNumero(
        values[ELayoutColumns.C_CVE_EJECUTIVO],
      );

    if (!ejecutivo)
      ejecutivo = await this.coreInformacionEjecutivoRepository.create({
        proyecto: new Types.ObjectId(session.proyecto),
        numero: values[ELayoutColumns.C_CVE_EJECUTIVO],
        nombre: values[ELayoutColumns.D_NOM_EJECUTIVO],
      } as CoreInformacionEjecutivoDto);

    const folio: CoreFolioDto = {
      folioMultisistema: proyectoFolio.folio,
      folioCliente: `${titular.numeroCliente}-${proyectoFolio.folio}`,
      proyecto: new Types.ObjectId(session.proyecto),
      tipoCarga: ETipoCarga.MASIVA,
      usuario: new Types.ObjectId(session.usuario),
      tipoMovimiento, //tipoMovimiento.clave,
      giro, //giro.clave,
      oficina,
      titular: new Types.ObjectId(titular._id),
      ejecutivo: new Types.ObjectId(ejecutivo._id),
    };

    const folioCreated: any = await this.coreFolioRepository.create(folio);

    this._logger.verbose(
      `::: Folio created => ${JSON.stringify(folioCreated)}`,
    );

    const bitacoraCreated = await this.bitActividadService.create({
      data: <any>{
        folio: new Types.ObjectId(folioCreated._id),
        actividad: EKycActividad.NUEVO_FOLIO,
        usuario: new Types.ObjectId(session.usuario),
        estatusBitacora: EstatusBitacoraConsts.ALTA_FOLIO,
      }, //REVIEW (any)
      lang,
    });

    this._logger.verbose(
      `::: Bitacora created => ${JSON.stringify(bitacoraCreated)}`,
    );

    const fechaVigencia: Date = moment(
      values[ELayoutColumns.N_FECHA_VIGENCIA],
      ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'dd/MM/yyyy'],
      true,
    )
      .startOf('day')
      .toDate();

    const polizaCreated = await this.corePolizaRepository.create({
      folio: new Types.ObjectId(folioCreated._id),
      aseguradora: new Types.ObjectId(
        clavesCatalogos.find(
          (c) => c.type === ELayoutCatalogoTypeDto.ASEGURADORA,
        )._id,
      ),
      riesgo: clavesCatalogos.find(
        (c) => c.type === ELayoutCatalogoTypeDto.RIESGO,
      ).clave,
      unidad: clavesCatalogos.find(
        (c) => c.type === ELayoutCatalogoTypeDto.UNIDAD,
      ).clave,
      fechaVigencia,
    } as CorePolizaDto);

    this._logger.verbose(
      `::: Póliza created => ${JSON.stringify(polizaCreated)}`,
    );

    const infoContacto: CoreInformacionContactoDto = {
      folio: new Types.ObjectId(folioCreated._id),
      nombre: values[ELayoutColumns.H_CONTACTO_CORRESPONDENCIA],
      tipo: clavesCatalogos.find(
        (c) => c.type === ELayoutCatalogoTypeDto.TIPO_CONTACTO,
      ).clave,
      correos: values[ELayoutColumns.I_EMAIL_CORRESPONDENCIA]
        .replace(/\s/g, '')
        .split(','),
    };

    const infoContactoCreated =
      await this.coreInformacionContactoRepository.create(infoContacto);

    this._logger.verbose(
      `::: InfoContacto created => ${JSON.stringify(infoContactoCreated)}`,
    );

    const telefonos: Array<string> = values[
      ELayoutColumns.J_TELEFONO_CORRESPONDENCIA
    ]
      .toString()
      .replace(/ /g, '')
      .split(';');

    await this.coreTelefonoContactoRepository.createMany(
      telefonos.map((tel: string) => {
        const hasExtensions: boolean = tel.includes('(');
        const phone = hasExtensions ? tel.substring(0, tel.indexOf('(')) : tel;
        let extensiones: Array<string> = [];
        if (hasExtensions)
          extensiones = tel
            .substring(tel.indexOf('(') + 1, tel.length - 1)
            .split(',');

        return {
          folio: new Types.ObjectId(folioCreated._id),
          telefono: phone,
          extensiones,
        } as CoreTelefonoContactoDto;
      }),
    );

    await this.coreComentarioService.create({
      data: {
        folio: new Types.ObjectId(folioCreated._id),
        bitacora: bitacoraCreated.data._id,
        comentarios: EComentario.SIN_COMENTARIOS,
        actividad: EKycActividad.NUEVO_FOLIO,
      },
      lang,
    });

    const workflowStarted = await this.workflowService.iniciar({
      session,
      workflow: {
        folio: folioCreated._id,
        actividadInicial: 1,
      },
      lang,
    });

    this._logger.verbose(
      `::: Workflow created => ${JSON.stringify(workflowStarted)}`,
    );
    const folioReport: FolioReportType[] =
        await this.coreFolioRepository.selectFolioReportByIdFolio(
            folioCreated._id,
        );
    await this.coreFolioReportService.createFolioReport(folioReport[0])
  }

  async validateExistsFolio(
    codigoCliente: string,
    desUnidad: string,
    nomRiesgo: string,
    nomAseguradora: string,
    fechaVigencia: string,
    clavesCatalogos: Array<ILayoutCatalogoResponseDto>,
  ): Promise<boolean> {
    let titular: any = await this.coreTitularRepository.findOneByNumeroCliente(
      codigoCliente,
    );

    if (!titular) return false;

    const folios: any[] = await this.coreFolioRepository.findAllByTitular(
      titular._id,
    );

    if (folios.length === 0) return false;

    const polizas = await this.corePolizaRepository.selectAllByFolios(
      folios.map((f) => new Types.ObjectId(f._id)),
    );

    if (polizas.length === 0) return false;

    const unidad = clavesCatalogos.find(
      (c) => c.type === ELayoutCatalogoTypeDto.UNIDAD,
    ).clave;

    const riesgo = clavesCatalogos.find(
      (c) => c.type === ELayoutCatalogoTypeDto.RIESGO,
    ).clave;

    const aseguradora = clavesCatalogos.find(
      (c) => c.type === ELayoutCatalogoTypeDto.ASEGURADORA,
    )._id;

    if (!unidad || !riesgo || !aseguradora) return false;

    return polizas.some(
      (p) =>
        p.aseguradora.equals(aseguradora) &&
        p.riesgo === riesgo &&
        p.unidad === unidad &&
        moment(p.fechaVigencia).format('DD/MM/YYYY') ===
        moment(fechaVigencia).format('DD/MM/YYYY'),
    );
  }

  async validateHasConfigurationDocumental(
    proyecto: string,
    aseguradora: string,
    tipoPersona: number,
  ): Promise<boolean> {
    return await this.admConfiguracionDocumentalService.existsConfigurationDocumentalByProyectoAseguradora(
      {
        proyecto,
        aseguradora,
        tipoPersona,
      },
    );
  }

  // Tiene los correos de la aseguradora
  async validateHasConfigurationAseguradora(
    proyecto: string,
    aseguradora: string,
  ): Promise<boolean> {
    return await this.admConfiguracionAseguradoraService.existsByProyectoAseguradora(
      {
        proyecto,
        aseguradora,
      },
    );
  }

  //Validar que la oficina pertenezca a la aseguradora
  async validateAseguradoraContainsOficina(
    id: string,
    oficina: number,
  ): Promise<boolean> {
    return await this.admAseguradoraRepository.containsOficinaByClave(
      id,
      oficina,
    );
  }
}
