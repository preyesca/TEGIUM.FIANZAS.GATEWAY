import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { CatSharedService } from 'src/modules/catalogo/domain/services/_cat.shared.service';
import { CatEstatusGeneralRepository } from 'src/modules/catalogo/persistence/repository/cat.estatus-general.repository';
import { CatGiroRepository } from 'src/modules/catalogo/persistence/repository/cat.giro.repository';
import { CatPaisRepository } from 'src/modules/catalogo/persistence/repository/cat.pais.repository';
import { CatTipoPersonaRepository } from 'src/modules/catalogo/persistence/repository/cat.tipo-persona.repository';
import { AdmAseguradoraRepository } from '../../persistence/repository/adm.aseguradora.repository';
import { AdmConfiguracionDocumentalRepository } from '../../persistence/repository/adm.configuracion-documental.repository';
import { AdmDocumentoRepository } from '../../persistence/repository/adm.documento.repository';
import { AdmProyectoRepository } from '../../persistence/repository/adm.proyecto.repository';
import { AdmConfiguracionDocumentalDetalleDto, AdmConfiguracionDocumentalDetalleResponseDto, AdmConfiguracionDocumentalDto, AdmConfiguracionDocumentalResponseDto } from '../dto/adm.configuracion-documental.dto';
import { CoreTitularRepository } from 'src/modules/core/persistence/repository/core.titular.repository';

@Controller()
export class AdmConfiguracionDocumentalService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly catSharedService: CatSharedService,
    private readonly admProyectoRepository: AdmProyectoRepository,
    private readonly admDocumentoRepository: AdmDocumentoRepository,
    private readonly admAseguradoraRepository: AdmAseguradoraRepository,
    private readonly admConfiguracionDocumentalRepository: AdmConfiguracionDocumentalRepository,
    private readonly catPaisRepository: CatPaisRepository,
    private readonly catTipoPersonaRepository: CatTipoPersonaRepository,
    private readonly catGiroRepository: CatGiroRepository,
    private readonly catEstatusGeneralRepository: CatEstatusGeneralRepository,
    private readonly coreTitularRepository: CoreTitularRepository,
  ) {}

  async create(payload: {
    body: AdmConfiguracionDocumentalDto;
    lang: string;
  }): Promise<ResponseDto> {
    const data = payload.body;
    data.aseguradora = new Types.ObjectId(data.aseguradora);
    data.proyecto = new Types.ObjectId(data.proyecto);

    const detail: AdmConfiguracionDocumentalDetalleDto[] = [];
    data.documento.forEach((element: AdmConfiguracionDocumentalDetalleDto) => {
      let newDetail: AdmConfiguracionDocumentalDetalleDto = {
        documento: new Types.ObjectId(element.documento),
        activo: element.activo,
        obligatorio: element.obligatorio,
        ocr: element.ocr,
        vigencia: element.vigencia,
        motivosRechazo: element.motivosRechazo,
      };
      detail.push(newDetail);
    });
    data.documento = detail;

    if (
      await this.admConfiguracionDocumentalRepository.exists(
        data.pais,
        data.proyecto,
        data.aseguradora,
        data.tipoPersona,
        data.giro,
      )
    )
      return DefaultResponse.sendConflict(
        this.i18n.translate(
          'administracion.VALIDATIONS.EXISTS.CONFIGURACION_DOCUMENTAL',
          {
            lang: payload.lang,
          },
        ),
      );

    const newConfiguracionDocumental: AdmConfiguracionDocumentalDto = data;
    const created = await this.admConfiguracionDocumentalRepository.create(
      newConfiguracionDocumental,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  // //FIXME: RMQServices_Administracion.CONFIGURACION_DOCUMENTAL.paginate)
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

    const dataPaginate =
      await this.admConfiguracionDocumentalRepository.paginate(
        payload.paginateParams,
      );

    const claves = dataPaginate.docs.reduce(
      (value, configuracion) => {
        value.paisIds.add(configuracion.pais);
        value.aseguradoraIds.add(configuracion.aseguradora);
        value.proyectoIds.add(configuracion.proyecto);
        value.tipoPersonaIds.add(configuracion.tipoPersona);
        value.giroIds.add(configuracion.giro);
        value.estatusIds.add(configuracion.estatus);
        return value;
      },
      {
        paisIds: new Set<number>(),
        aseguradoraIds: new Set<string>(),
        proyectoIds: new Set<string>(),
        tipoPersonaIds: new Set<number>(),
        giroIds: new Set<number>(),
        estatusIds: new Set<number>(),
      },
    );

    const [paises, aseguradoras, proyectos, tipoPersonas, giros, estatus]: [
      any[],
      any[],
      any[],
      any[],
      any[],
      any[],
    ] = await Promise.all([
      this.catPaisRepository.selectInByClave(Array.from(claves.paisIds)),
      this.admAseguradoraRepository.selectIn(Array.from(claves.aseguradoraIds)),
      this.admProyectoRepository.selectIn(Array.from(claves.proyectoIds)),
      this.catTipoPersonaRepository.selectInByClave(
        Array.from(claves.tipoPersonaIds),
      ),
      this.catGiroRepository.selectInByClave(Array.from(claves.giroIds)),
      this.catEstatusGeneralRepository.selectInByClave(
        Array.from(claves.estatusIds),
      ),
    ]);

    dataPaginate.docs = dataPaginate.docs.map((element: any) => {
      return {
        _id: element._id,
        paisIcon: paises.find((_) => _.clave === element.pais)?.icon,
        paisDescripcion: paises.find((_) => _.clave === element.pais)
          ?.descripcion,
        aseguradora: element.aseguradora,
        aseguradoraNombreComercial: aseguradoras.find((a) =>
          element.aseguradora.equals(a._id),
        )?.nombreComercial,
        proyecto: element.proyecto,
        proyectoCeco: proyectos.find((a) => element.proyecto.equals(a._id))
          ?.codigo,
        tipoPersona: element.tipoPersona,
        tipoPersonaDescripcion: tipoPersonas.find(
          (_) => _.clave === element.tipoPersona,
        )?.descripcion,
        giro: element.giro,
        giroDescripcion: giros.find((_) => _.clave === element.giro)
          ?.descripcion,
        estatus: element.estatus,
        estatusDescripcion: estatus.find((_) => _.clave === element.estatus)
          ?.descripcion,
      };
    });

    return DefaultResponse.sendOk('', dataPaginate);
  }

  //FIXME:
  //   RMQServices_Administracion.CONFIGURACION_DOCUMENTAL.getCatalogosToCreate,
  // )
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
      await this.catSharedService.configuracion_documental_getCatalogos();

    if (!catalogosResult) return catalogosResult;

    const catalogos = { ...catalogosResult.data };
    catalogos.aseguradora = await this.admAseguradoraRepository.getAll();
    catalogos.proyecto = await this.admProyectoRepository.getAll();
    catalogos.documento = await this.admDocumentoRepository.getAll();

    return DefaultResponse.sendOk('', catalogos);
  }

  //FIXME:
  //   RMQServices_Administracion.CONFIGURACION_DOCUMENTAL.findOneToEdit,
  // )
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

      const dataConfiguracionDocumental =
      await this.admConfiguracionDocumentalRepository.findOne(payload.id);

    if (!dataConfiguracionDocumental)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'administracion.VALIDATIONS.NOT_FOUND.CONFIGURACION_DOCUMENTAL',
          {
            lang: payload.lang,
          },
        ),
      );

    const catalagosResult =
      await this.catSharedService.configuracion_documental_getCatalogos();

    if (!catalagosResult) return catalagosResult;

    const catalogos = { ...catalagosResult.data };
    catalogos.aseguradora = await this.admAseguradoraRepository.getAll();
    catalogos.proyecto = await this.admProyectoRepository.getAll();
    catalogos.documento = await this.admDocumentoRepository.getAll();

    const documentos: any[] = [];

    dataConfiguracionDocumental.documento.forEach((element: any) => {
      const documento = catalogos.documento.find(
        (a: any) => a._id.toString() === element.documento.toString(),
      );

      documentos.push({
        _id: element.documento,
        categoria: documento?.categoria,
        nombreBase: documento?.nombreBase,
        clave: documento?.clave,
        activo: element.activo,
        obligatorio: element.obligatorio,
        ocr: element.ocr,
        vigencia: element.vigencia,
        motivosRechazo: element.motivosRechazo,
      });
    });

    const data: any = {
      configuracionDocumental: {
        pais: catalogos?.paises.find(
          (p: any) => p.clave === dataConfiguracionDocumental.pais,
        )?.clave,
        tipoPersona: catalogos?.tipoPersona.find(
          (p: any) => p.clave === dataConfiguracionDocumental.tipoPersona,
        )?.clave,
        giro: catalogos?.giro.find(
          (p: any) => p.clave === dataConfiguracionDocumental.giro,
        )?.clave,
        estatus: catalogos?.estatus.find(
          (p: any) => p.clave === dataConfiguracionDocumental.estatus,
        )?.clave,
        aseguradora: dataConfiguracionDocumental.aseguradora,
        proyecto: dataConfiguracionDocumental.proyecto,
        documento: documentos,
      },
      catalogos,
    };

    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Administracion.CONFIGURACION_DOCUMENTAL.update
  async update(payload: {
    id: any;
    data: AdmConfiguracionDocumentalDto;
    lang: string;
  }) {
    payload.data.aseguradora = new Types.ObjectId(payload.data.aseguradora);
    payload.data.proyecto = new Types.ObjectId(payload.data.proyecto);

    const configuracion =
      await this.admConfiguracionDocumentalRepository.findOne(payload.id);

    const isModifyRegla =
      configuracion.pais === payload.data.pais &&
      configuracion.proyecto.toString() === payload.data.proyecto.toString() &&
      configuracion.aseguradora.toString() ===
        payload.data.aseguradora.toString() &&
      configuracion.tipoPersona === payload.data.tipoPersona &&
      configuracion.giro === payload.data.giro;

    if (!isModifyRegla) {
      const duplicado = await this.admConfiguracionDocumentalRepository.exists(
        payload.data.pais,
        payload.data.proyecto,
        payload.data.aseguradora,
        payload.data.tipoPersona,
        payload.data.giro,
      );

      if (duplicado) {
        return DefaultResponse.sendConflict(
          this.i18n.translate(
            'administracion.VALIDATIONS.EXISTS.CONFIGURACION_DOCUMENTAL',
            {
              lang: payload.lang,
            },
          ),
        );
      }
    }

    const detail: AdmConfiguracionDocumentalDetalleDto[] = [];
    payload.data.documento.forEach(
      (element: AdmConfiguracionDocumentalDetalleDto) => {
        const documentoId=element.documento || (element as any)._id
        let newDetail: AdmConfiguracionDocumentalDetalleDto = {
          documento: new Types.ObjectId(documentoId),
          activo: element.activo,
          obligatorio: element.obligatorio,
          ocr: element.ocr,
          vigencia: element.vigencia,
          motivosRechazo: element.motivosRechazo,
        };
        detail.push(newDetail);
      },
    );
    payload.data.documento = detail;

    const updated = await this.admConfiguracionDocumentalRepository.update(
      payload.id.id,
      payload.data,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }

  //FIXME: RMQServices_Administracion.CONFIGURACION_DOCUMENTAL.getConfiguracionDocumental
  async getConfiguracionDocumental(payload: {
    proyecto: string;
    aseguradora: string;
    titular: string;
    lang: string;
  }): Promise<ResponseDto> {
    const proyecto = await this.admProyectoRepository.findById(
      new Types.ObjectId(payload.proyecto),
    );

    if (!proyecto)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('administracion.VALIDATIONS.NOT_FOUND.PROYECTO', {
          lang: payload.lang,
        }),
      );

      const documentos = await this.admDocumentoRepository.getAll();
      const rpta = await this.coreTitularRepository.findOne(payload.titular);
  
      const configuracion =
        await this.admConfiguracionDocumentalRepository.findCargaDocumentalMasiva(
          proyecto.pais,
          new Types.ObjectId(payload.aseguradora),
          new Types.ObjectId(proyecto._id),
          rpta.tipoPersona
        );
  
      if (!configuracion)
        return DefaultResponse.sendNotFound(
          this.i18n.translate(
            'administracion.VALIDATIONS.NOT_FOUND.CONFIGURACION_DOCUMENTAL',
            {
              lang: payload.lang,
            },
          ),
        );
  
      let configuracionResponse: AdmConfiguracionDocumentalResponseDto = {
        pais: configuracion.pais,
        aseguradora: configuracion.aseguradora,
        proyecto: configuracion.proyecto,
        tipoPersona: configuracion.tipoPersona,
        giro: configuracion.giro,
        estatus: configuracion.estatus,
        documento: Array<AdmConfiguracionDocumentalDetalleResponseDto>(),
      };
      configuracion.documento.forEach((element: any) => {
        const documento = documentos.find((a: any) =>
          new Types.ObjectId(a._id).equals(element.documento),
        );
        configuracionResponse.documento.push({
          ...element,
          nombre: documento?.nombre,
          categoria: documento?.categoria,
          clave: documento?.clave
        });
      });
  
      return DefaultResponse.sendOk('', configuracionResponse);
  }

  /* FIXME: RMQServices_Administracion.CONFIGURACION_DOCUMENTAL.existsConfigurationDocumentalByProyectoAseguradora*/
  async existsConfigurationDocumentalByProyectoAseguradora(payload: {
    proyecto: string;
    aseguradora: string;
    tipoPersona: number;
  }): Promise<boolean> {
    const proyecto = await this.admProyectoRepository.findById(
      new Types.ObjectId(payload.proyecto),
    );

    if (proyecto) {
      const configuracion =
        await this.admConfiguracionDocumentalRepository.findCargaDocumentalUploadLayout(
          proyecto.pais,
          new Types.ObjectId(payload.aseguradora),
          new Types.ObjectId(proyecto._id),
          payload.tipoPersona,
        );

      return configuracion !== null;
    }

    return false;
  }
}
