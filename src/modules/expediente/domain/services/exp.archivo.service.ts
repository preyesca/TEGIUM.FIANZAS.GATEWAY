import { Controller, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmConfiguracionDocumentalService } from 'src/modules/administracion/domain/services/adm.configuracion-documental.service';
import { AdmDocumentoService } from 'src/modules/administracion/domain/services/adm.documento.service';
import { AdmDocumentoRepository } from 'src/modules/administracion/persistence/repository/adm.documento.repository';
import { CatMotivoRechazoRepository } from 'src/modules/catalogo/persistence/repository/cat.motivo-rechazo.repository';
import { CoreTitularRepository } from 'src/modules/core/persistence/repository/core.titular.repository';
import { ExpArchivo } from '../../persistence/database/exp.archivo.schema';
import { ExpArchivoRepository } from '../../persistence/repository/exp.archivo.repository';
import { EMimeTypes } from '../helpers/common/mime-type.enum';
import { ExpArchivoDto } from '../helpers/dto/exp.archivo.dto';
import { GeneralValidator } from '../helpers/validators/general.validators';

@Controller()
export class ExpArchivoService {
  private readonly _logger = new Logger(ExpArchivoService.name);

  private readonly apiUrlCotejo = `${process.env.MSH_URL_DOCUMENTS_MANAGER}/api/fianzas/cotejar-o-descotejar`;

  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly expArchivoRepository: ExpArchivoRepository,
    private readonly coreTitularRepository: CoreTitularRepository,
    private readonly catMotivoRechazoRepository: CatMotivoRechazoRepository,
    private readonly admDocumentoRepository: AdmDocumentoRepository,
    private readonly admDocumentoService: AdmDocumentoService,
    private readonly admConfiguracionDocumentalService: AdmConfiguracionDocumentalService,
  ) { }

  async cotejarODescotejar(payload: { data: any; lang: string }) {
    const { data, lang } = payload;

    const body = JSON.stringify(data);

    this._logger.verbose('=========================== START MESSAGE');
    this._logger.verbose(`Url  : ${this.apiUrlCotejo}`);
    this._logger.verbose(`Body : ${body}`);

    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(this.apiUrlCotejo, {
      method: 'POST',
      headers,
      body,
    });

    return await response.json();
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.create)
  async create(payload: {
    data: ExpArchivoDto;
    lang: string;
  }): Promise<ResponseDto> {
    payload.data.aseguradora = payload.data.aseguradora
      ? new Types.ObjectId(payload.data.aseguradora)
      : undefined;
    payload.data.titular = new Types.ObjectId(payload.data.titular);
    payload.data.documento = new Types.ObjectId(payload.data.documento);
    payload.data.usuarioAlta = new Types.ObjectId(payload.data.documento);

    const created = await this.expArchivoRepository.create(payload.data);

    return DefaultResponse.sendCreated(
      this.i18n.translate('all.MESSAGES.ERROR.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  //FIXME: FIND_ONE_ARCHIVOS
  async selectOne(idExpediente: any): Promise<ResponseDto> {
    const expediente = await this.expArchivoRepository.findOne(idExpediente);
    return expediente
      ? DefaultResponse.sendOk('', expediente)
      : DefaultResponse.sendNotFound('');
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.findCatalogostTitularesByProyecto
  async GetCatalogostTitularesByProyecto(payload: {
    session: any;
    lang: string;
  }) {
    const titulares =
      await this.coreTitularRepository.findAllTitularesByProyecto(
        payload.session.proyecto,
      );
    return {
      success: true,
      data: titulares,
    };
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.findByTitular
  async findTitular(payload: {
    session: any;
    pais: number;
    aseguradora: string;
    proyecto: string;
    titular: string;
    lang: string;
  }) {
    const { aseguradora, proyecto, titular } = payload;
    const archivos: ExpArchivo[] =
      await this.expArchivoRepository.selectByTitular(titular);

    const archivosAgrupado = GeneralValidator.collection_archivos_distinct(
      archivos,
      ['documento', 'titular'],
    );

    const documentosFilter = [
      ...new Set(archivosAgrupado.map(({ documento }) => documento)),
    ];

    const documentos: any = await this.admDocumentoRepository.selectIn(
      documentosFilter,
    );

    const configuracionDocumentalResult =
      await this.admConfiguracionDocumentalService.getConfiguracionDocumental({
        proyecto,
        aseguradora,
        titular,
        lang: '',
      });

    if (!configuracionDocumentalResult.success)
      return configuracionDocumentalResult;

    const configuracionDocumental = configuracionDocumentalResult.data;

    const motivosRechazo = await this.catMotivoRechazoRepository.select();

    const expedienteDigital: any[] = [];

    archivosAgrupado.forEach((item: any) => {
      const documento = documentos.find(
        (x) => x._id.toString() === item.documento.toString(),
      );
      const configuracion_documental = configuracionDocumental.documento.find(
        (x) => x.documento.toString() === item.documento.toString(),
      );

      if (configuracion_documental) {
        let motivos_documentos = [];
        if (configuracion_documental?.motivosRechazo.length > 0) {
          motivos_documentos = configuracion_documental.motivosRechazo
            ? [
              ...new Set(
                motivosRechazo.filter(
                  (x) =>
                    !!configuracion_documental.motivosRechazo.find(
                      (y) => y == x.clave,
                    ),
                ),
              ),
            ]
            : [];
        }

        const arrayUrl = item.url.split('.');
        const mimeType = '.' + arrayUrl[arrayUrl.length - 1];

        const archivo = {
          id: item._id,
          documento: documento.nombre,
          documento_id: documento._id,
          filename: documento.nombre + mimeType,
          categoria: documento.categoria,
          contentType: EMimeTypes[mimeType],
          url: item.url,
          correcto: configuracion_documental?.correcto,
          motivos: motivos_documentos,
          fechaVigencia: configuracion_documental?.fechaVigencia,
          clave: documento.clave,
          cotejado: item.cotejado
        };
        expedienteDigital.push(archivo);
      }
    });

    return { success: true, message: '', data: expedienteDigital };
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.findByTitularPaginated
  async findTitularPaginated(
    pais: number,
    aseguradora: string,
    proyecto: string,
    titular: string,
    @I18n() i18n: I18nContext,
    paginate: any,
  ) {
    let archivos = await this.expArchivoRepository.selectByTitularPaginated(
      titular,
      paginate,
    );

    if (!archivos) return DefaultResponse.sendOk('', []);

    const documentosFilter = [
      ...new Set(archivos.docs.map(({ documento }) => documento)),
    ];

    const documentos: any = await this.admDocumentoService.selectIn(
      documentosFilter,
    );

    const expedienteDigital: any[] = [];

    archivos.docs.forEach((item: any) => {
      const documento = documentos.find(
        (x) => x._id.toString() === item.documento.toString(),
      );

      const arrayUrl = item.url.split('.');
      const mimeType = '.' + arrayUrl[arrayUrl.length - 1];

      const archivo = {
        id: item._id,
        documento: documento.nombre,
        documento_id: documento._id,
        filename: item.nombreCorto,
        categoria: documento.categoriaData.descripcion,
        contentType: EMimeTypes[mimeType],
        url: item.url,
        enviado: item.enviado,
        fechaAlta: item.fechaHoraAlta,
        version: item.version,
        clave: item.clave,
      };
      expedienteDigital.push(archivo);
    });

    const modifiedResponse = DefaultResponse.sendOk('Archivos encontradas', {
      docs: expedienteDigital,
      totalDocs: archivos.totalDocs,
      limit: archivos.limit,
      totalPages: archivos.totalPages,
      page: archivos.page,
    });

    return modifiedResponse;
  }

  async findTitularCotejoPaginated(payload: {
    session: any;
    pais: number;
    aseguradora: string;
    proyecto: string;
    titular: string;
    lang: string;
    paginate: any;
  }) {
    let { aseguradora, proyecto, paginate, titular } = payload;
    const archivos: ExpArchivo[] =
      await this.expArchivoRepository.selectByTitularPaginatedCotejo(
        payload.titular,
      );

    const archivosAgrupado = GeneralValidator.collection_archivos_distinct(
      archivos,
      ['documento', 'titular'],
    );

    const documentosFilter = [
      ...new Set(archivosAgrupado.map(({ documento }) => documento)),
    ];

    const documentos: any = await this.admDocumentoRepository.selectIn(
      documentosFilter,
    );

    const configuracionDocumentalResult =
      await this.admConfiguracionDocumentalService.getConfiguracionDocumental({
        proyecto,
        aseguradora,
        titular,
        lang: '',
      });

    if (!configuracionDocumentalResult.success)
      return configuracionDocumentalResult;

    const configuracion = configuracionDocumentalResult.data;
    let expedienteDigital: any[] = [];

    archivosAgrupado.forEach((item) => {
      const documento = documentos.find(
        (x) => x._id.toString() === item.documento.toString(),
      );
      const configuracion_documental = configuracion.documento.find(
        (x) => x.documento.toString() === item.documento.toString(),
      );

      if (configuracion_documental) {
        let sizeFile = 0;

        if (item.cotejado) sizeFile = item.cotejado.size;
        else sizeFile = item.archivoSize;

        const arrayUrl = item.url.split('.');
        const mimeType = '.' + arrayUrl[arrayUrl.length - 1];

        const archivo = {
          id: item._id,
          documento: documento.nombre,
          filename: documento.nombre + mimeType,
          contentType: EMimeTypes[mimeType],
          documento_id: documento._id,
          url: item.url,
          fechaAlta: item.fechaHoraAlta,
          nombreCorto: item.nombreCorto,
          cotejado: item.cotejado,
          archivoSize: sizeFile,
        };
        expedienteDigital.push(archivo);
      }
    });

    if (paginate != '') {
      const modifiedResponse = DefaultResponse.sendOk('', {
        docs: expedienteDigital.slice(
          (+paginate.page - 1) * +paginate.limit,
          +paginate.page * +paginate.limit,
        ),
        totalDocs: expedienteDigital.length,
        limit: +paginate.limit,
        totalPages: Math.ceil(expedienteDigital.length / +paginate.limit),
        page: +paginate.page,
      });

      return modifiedResponse;
    }

    return DefaultResponse.sendOk('', expedienteDigital);
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.checkByTitular
  async GetConfiguracionMasiva(payload: {
    session?: any;
    pais: number;
    aseguradora: string;
    proyecto: string;
    titular: string;
    lang: string;
  }) {
    const { aseguradora, proyecto, titular, lang } = payload;

    const configuracionResult: any =
      await this.admConfiguracionDocumentalService.getConfiguracionDocumental({
        proyecto: proyecto,
        aseguradora: aseguradora,
        titular: titular,
        lang: '',
      });

    if (!configuracionResult.success) return configuracionResult;

    const configuracion = configuracionResult.data;

    if (!configuracion)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'administracion.VALIDATIONS.NOT_FOUND.CONFIGURACION_DOCUMENTAL',
          { lang: lang },
        ),
      );

    const archivos: ExpArchivo[] =
      await this.expArchivoRepository.selectByTitular(titular);

    const documentosPendientes: any[] = [];
    if (archivos.length === 0) {
      configuracion.documento.forEach((item: any) => {
        if (item.activo) {
          documentosPendientes.push({
            nombre: item.nombre,
            clave: item.clave,
            obligatorio: item.obligatorio,
            lang: item.lang,
          });
        }
      });
    } else {
      configuracion.documento.forEach((item: any) => {
        const correcto = archivos.find((doc) =>
          doc.documento.equals(item.documento),
        );
        if (!correcto) {
          documentosPendientes.push({
            nombre: item.nombre,
            clave: item.clave,
            obligatorio: item.obligatorio
          });
        }
      });
    }
    return { success: true, message: '', data: documentosPendientes };
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.findByTitularAndTypeDocument
  async findByTitularAndTypeDocument(payload: {
    session: any;
    pais: number;
    aseguradora: string;
    proyecto: string;
    titular: string;
    lang: string;
    idDocument: string;
  }) {
    let archivos: any[] = [];
    const expedienteDigital: any[] =
      await this.expArchivoRepository.selectByTitularAndTypeDocument(
        payload.titular,
        payload.idDocument,
      );

    const compareVersions = (a: any, b: any) => {
      return b.version - a.version;
    };

    expedienteDigital.forEach((item: any) => {
      const arrayUrl = item.url.split('.');
      const mimeType = '.' + arrayUrl[arrayUrl.length - 1];

      const archivo = {
        id: item._id,
        filename: item.nombreCorto,
        contentType: EMimeTypes[mimeType],
        url: item.url,
        version: item.version,
        eliminado: item.eliminado,
      };
      archivos.push(archivo);
    });

    const archivosFiltrados = archivos
      .filter((archivo) => archivo.eliminado === false)
      .sort(compareVersions);

    if (archivosFiltrados.length > 0) {
      return { success: true, message: '', data: archivosFiltrados };
    }

    return {
      success: true,
      message: this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND', {
        lang: payload.lang,
      }),
      data: [],
    };
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.findByVersionFile
  async findVersion(payload: { titular: string; documento: string }) {
    const documentos =
      await this.expArchivoRepository.selectByTitularAndTypeDocument(
        payload.titular,
        payload.documento,
      );

    if (documentos.length === 0) return 1;

    const ultimaVersion = documentos.sort((a, b) => b.version - a.version)[0]
      .version;

    return ultimaVersion + 1;
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.delete
  async delete(payload: { id: string }) {
    const resp = await this.expArchivoRepository.delete(payload.id);
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.DELETED', { lang: '' }),
      resp,
    );
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.updateEnviado
  async updateEnviado(payload: { session: any; data: any }) {
    const archivo = await this.expArchivoRepository.findOne(payload.data.id);
    if (payload.data.seleccionado == 'true') {
      archivo.enviado = {
        usuario: new Types.ObjectId(payload.session.usuario),
        fechaSeleccion: new Date(),
      };
    } else {
      archivo.enviado = null;
    }
    return await this.expArchivoRepository.update(
      new Types.ObjectId(payload.data.id),
      archivo,
    );
  }

  //FIXME: RMQFianzasServices_Expediente.EXPEDIENTE_DIGITAL.findSeleccionados)
  async findSeleccionados(payload: any) {

    const data =
      await this.expArchivoRepository.getDocumentosByTitular(
        payload.titular,
      );

    let filter = data.filter((x) => x.enviado != null).map((x) => x.id);
    return DefaultResponse.sendOk('', filter);
  }
}
