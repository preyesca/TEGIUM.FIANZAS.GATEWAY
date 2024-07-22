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
import { CatPaisRepository } from 'src/modules/catalogo/persistence/repository/cat.pais.repository';
import { AdmAseguradoraRepository } from '../../persistence/repository/adm.aseguradora.repository';
import { AdmConfiguracionAseguradoraRepository } from '../../persistence/repository/adm.configuracion-aseguradora.repository';
import { AdmProyectoRepository } from '../../persistence/repository/adm.proyecto.repository';
import { AdmConfiguracionAseguradoraDto } from '../dto/adm.configuracion-aseguradora.dto';

@Controller()
export class AdmConfiguracionAseguradoraService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly catSharedService: CatSharedService,
    private readonly catPaisRepository: CatPaisRepository,
    private readonly admProyectoRepository: AdmProyectoRepository,
    private readonly admAseguradoraRepository: AdmAseguradoraRepository,
    private readonly admConfigAseguradoraRepository: AdmConfiguracionAseguradoraRepository,
  ) {}

  //FIXME: RMQServices_Administracion.CONFIGURACION_ASEGURADORA.create
  async create(payload: {
    body: AdmConfiguracionAseguradoraDto;
    lang: string;
  }) {
    payload.body.oficinas.forEach((x) => {
      delete x['descripcion'];
    });

    let data: AdmConfiguracionAseguradoraDto = {
      aseguradora: new Types.ObjectId(payload.body.aseguradora),
      proyecto: new Types.ObjectId(payload.body.proyecto),
      oficinas: payload.body.oficinas,
      pais: payload.body.pais,
    };

    if (
      await this.admConfigAseguradoraRepository.existsByPaisProyectoAseguradora(
        data.pais,
        data.proyecto,
        data.aseguradora,
      )
    )
      return DefaultResponse.sendConflict(
        this.i18n.translate(
          'administracion.VALIDATIONS.EXISTS.CONFIGURACION_ASEGURADORA',
          {
            lang: payload.lang,
          },
        ),
      );

    const created = await this.admConfigAseguradoraRepository.create(data);

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  //FIXME: RMQServices_Administracion.CONFIGURACION_ASEGURADORA.paginate
  async findAll(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }) {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: payload.lang,
        }),
      );

    const dataPaginate = await this.admConfigAseguradoraRepository.paginate(
      payload.paginateParams,
    );

    const claves = dataPaginate.docs.reduce(
      (value, configuracion) => {
        value.paisIds.add(configuracion.pais);
        value.aseguradoraIds.add(configuracion.aseguradora);
        value.proyectoIds.add(configuracion.proyecto);
        return value;
      },
      {
        paisIds: new Set<number>(),
        aseguradoraIds: new Set<string>(),
        proyectoIds: new Set<string>(),
      },
    );

    const [paises, aseguradoras, proyectos]: [any[], any[], any[]] =
      await Promise.all([
        this.catPaisRepository.selectInByClave(Array.from(claves.paisIds)),
        this.admAseguradoraRepository.selectIn(
          Array.from(claves.aseguradoraIds),
        ),
        this.admProyectoRepository.selectIn(Array.from(claves.proyectoIds)),
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
          ?.ceco,
        codigo: proyectos.find((a) => element.proyecto.equals(a._id))?.codigo,
      };
    });

    return DefaultResponse.sendOk('', dataPaginate);
  }

  //FIXME: RMQServices_Administracion.CONFIGURACION_ASEGURADORA.findOne
  async findOne(payload: { id: string; lang: string }): Promise<ResponseDto> {
    const dataConfiguracionAseguradora =
      await this.admConfigAseguradoraRepository.findOneByAseguradora(
        payload.id,
      );

    if (!dataConfiguracionAseguradora)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'administracion.VALIDATIONS.NOT_FOUND.CONFIGURACION_ASEGURADORA',
          {
            lang: payload.lang,
          },
        ),
      );

    const catalogosResult =
      await this.catSharedService.configuracion_aseguradora_getCatalogos();

    if (!catalogosResult) return catalogosResult;

    const catalogos = { ...catalogosResult.data };

    const [aseguradora]: [any[]] = await Promise.all([
      this.admAseguradoraRepository.getAll(),
    ]);

    const response = aseguradora.find(
      (p: any) => p._id.toString() === payload.id.toString(),
    );

    const data: any = {
      pais: catalogos?.paises.find(
        (p: any) => p.clave === dataConfiguracionAseguradora.pais,
      )?.clave,
      proyecto: dataConfiguracionAseguradora.proyecto,
      aseguradora: dataConfiguracionAseguradora.aseguradora,
      razonSocial: response.razonSocial,
      nombreComercial: response.nombreComercial,
      oficinas: dataConfiguracionAseguradora.oficinas,
    };

    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Administracion.CONFIGURACION_ASEGURADORA.findOneToEdit
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

    const dataConfiguracionAseguradora =
      await this.admConfigAseguradoraRepository.findOne(payload.id);

    if (!dataConfiguracionAseguradora)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'administracion.VALIDATIONS.NOT_FOUND.CONFIGURACION_ASEGURADORA',
          {
            lang: payload.lang,
          },
        ),
      );

    const catalogosResult =
      await this.catSharedService.configuracion_aseguradora_getCatalogos();

    if (!catalogosResult) return catalogosResult;

    const catalogos = { ...catalogosResult.data };

    const [proyecto, aseguradora]: [any[], any[]] = await Promise.all([
      this.admProyectoRepository.getAll(),
      this.admAseguradoraRepository.getAll(),
    ]);

    catalogos.proyecto = proyecto;
    catalogos.aseguradora = aseguradora;

    dataConfiguracionAseguradora.oficinas.map((x: any) => {
      x.descripcion = catalogos.oficinas.find(
        (o: any) => o.clave == x.oficina,
      )?.descripcion;
      return x;
    });

    const data: any = {
      configuracionAseguradora: {
        pais: catalogos?.paises.find(
          (p: any) => p.clave === dataConfiguracionAseguradora.pais,
        )?.clave,
        proyecto: dataConfiguracionAseguradora.proyecto,
        aseguradora: dataConfiguracionAseguradora.aseguradora,
        oficinas: dataConfiguracionAseguradora.oficinas,
      },
      catalogos,
    };

    return DefaultResponse.sendOk('', data);
  }

  // RMQServices_Administracion.CONFIGURACION_ASEGURADORA.getCatalogosToCreate
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
      await this.catSharedService.configuracion_aseguradora_getCatalogos();

    if (!catalogosResult) return catalogosResult;

    const catalogos = { ...catalogosResult.data };

    const [proyecto, aseguradora]: [any[], any[]] = await Promise.all([
      this.admProyectoRepository.getAll(),
      this.admAseguradoraRepository.getAll(),
    ]);

    catalogos.proyecto = proyecto;
    catalogos.aseguradora = aseguradora;

    return DefaultResponse.sendOk('', catalogos);
  }

  //FIXME: RMQServices_Administracion.CONFIGURACION_ASEGURADORA.update
  async update(payload: {
    id: string;
    data: AdmConfiguracionAseguradoraDto;
    lang: string;
  }): Promise<ResponseDto> {
    const dataConfiguracionAseguradora =
      await this.admConfigAseguradoraRepository.findOne(payload.id);

    const isModified =
      dataConfiguracionAseguradora.pais === payload.data.pais &&
      dataConfiguracionAseguradora.aseguradora.toString() ===
        payload.data.aseguradora.toString() &&
      dataConfiguracionAseguradora.proyecto.toString() ===
        payload.data.proyecto.toString();

    payload.data.oficinas.forEach((x) => {
      delete x['descripcion'];
    });

    let data: AdmConfiguracionAseguradoraDto = {
      aseguradora: new Types.ObjectId(payload.data.aseguradora),
      proyecto: new Types.ObjectId(payload.data.proyecto),
      oficinas: payload.data.oficinas,
      pais: payload.data.pais,
    };

    if (!isModified) {
      if (
        await this.admConfigAseguradoraRepository.existsByPaisProyectoAseguradora(
          data.pais,
          data.proyecto,
          data.aseguradora,
        )
      )
        return DefaultResponse.sendConflict(
          this.i18n.translate(
            'administracion.VALIDATIONS.EXISTS.CONFIGURACION_ASEGURADORA',
            {
              lang: payload.lang,
            },
          ),
        );
    }

    payload.data.aseguradora = new Types.ObjectId(payload.data.aseguradora);
    payload.data.proyecto = new Types.ObjectId(payload.data.proyecto);

    const updated = await this.admConfigAseguradoraRepository.update(
      payload.id,
      payload.data,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }

  // RMQServices_Administracion.CONFIGURACION_ASEGURADORA.existsConfigurationAseguradoraByProyectoAseguradora
  async existsByProyectoAseguradora(payload: {
    proyecto: string;
    aseguradora: string;
  }): Promise<boolean> {
    const proyecto = await this.admProyectoRepository.findById(
      new Types.ObjectId(payload.proyecto),
    );

    if (proyecto) {
      const configuracion =
        await this.admConfigAseguradoraRepository.existsByPaisProyectoAseguradora(
          proyecto.pais,
          new Types.ObjectId(proyecto._id),
          new Types.ObjectId(payload.aseguradora),
        );

      return configuracion !== null;
    }

    return false;
  }
}
