import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { Utilities } from 'src/app/utils/utilities';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { CatSharedService } from 'src/modules/catalogo/domain/services/_cat.shared.service';
import { CatEstatusGeneralRepository } from 'src/modules/catalogo/persistence/repository/cat.estatus-general.repository';
import { CatPaisRepository } from 'src/modules/catalogo/persistence/repository/cat.pais.repository';
import { AdmAseguradora } from '../../persistence/database/adm.aseguradora.schema';
import { AdmAseguradoraRepository } from '../../persistence/repository/adm.aseguradora.repository';
import { AdmAseguradoraDto } from '../dto/adm.aseguradora.dto';

@Controller()
export class AdmAseguradoraService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly catPaisRepository: CatPaisRepository,
    private readonly admAseguradoraRepository: AdmAseguradoraRepository,
    private readonly catEstatusGeneralRepository: CatEstatusGeneralRepository,
    private readonly catSharedService: CatSharedService,
  ) {}

  //FIXME: RMQServices_Administracion.ASEGURADORA.create
  async create(payload: { data: AdmAseguradoraDto; lang: string }) {
    const exist = await this.admAseguradoraRepository.checkExist(
      payload.data.pais,
      payload.data.nombreComercial.trim(),
      payload.data.razonSocial.trim(),
    );

    if (exist)
      return DefaultResponse.sendConflict(
        this.i18n.translate('administracion.VALIDATIONS.EXISTS.ASEGURADORA', {
          lang: payload.lang,
        }),
        payload.data,
      );

    const created = await this.admAseguradoraRepository.create(payload.data);

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.paginate
  async paginateAll(payload: {
    paginateParams: IPaginateParams;
    lang: string;
  }): Promise<ResponseDto> {
    const aseguradoras = await this.admAseguradoraRepository.paginateAll(
      payload.paginateParams,
    );

    const ids = aseguradoras.docs.reduce(
      (value, aseguradoras) => {
        value.paisIds.add(aseguradoras.pais);
        value.estatusIds.add(aseguradoras.estatus);
        return value;
      },
      {
        paisIds: new Set<number>(),
        estatusIds: new Set<number>(),
      },
    );

    const [paises, estatus]: [any[], any[]] = await Promise.all([
      this.catPaisRepository.selectInByClave(Array.from(ids.paisIds)),
      this.catEstatusGeneralRepository.selectInByClave(
        Array.from(ids.estatusIds),
      ),
    ]);

    aseguradoras.docs = aseguradoras.docs.map((aseguradora: any) => {
      return {
        _id: aseguradora._id,
        pais: paises.find((x) => x.clave == aseguradora.pais)?.descripcion,
        icon: paises.find((x) => x.clave == aseguradora.pais)?.icon,
        abreviatura: paises.find((x) => x.clave == aseguradora.pais)
          ?.abreviatura,
        nombreComercial: aseguradora.nombreComercial,
        razonSocial: aseguradora.razonSocial,
        altaProyecto: aseguradora.altaProyecto,
        documentos: aseguradora.documentos,
        estatus: estatus.find((x) => x.clave == aseguradora.estatus)
          ?.descripcion,
      };
    });

    return DefaultResponse.sendOk('', aseguradoras);
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.findOneToEdit
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

    const aseguradora = await this.admAseguradoraRepository.findOne(payload.id);

    if (!aseguradora)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'administracion.VALIDATIONS.NOT_FOUND.ASEGURADORA',
          {
            lang: payload.lang,
          },
        ),
      );

    const catalagos = (await this.catSharedService.aseguradora_getCatalogos())
      ?.data;

    const data: any = {
      aseguradora: {
        nombreComercial: aseguradora.nombreComercial,
        razonSocial: aseguradora.razonSocial,
        pais: catalagos?.paises.find((p: any) => p.clave === aseguradora.pais)
          ?.clave,
        estatus: catalagos?.estatus.find(
          (e: any) => e.clave == aseguradora.estatus,
        )?.clave,
        oficinas: aseguradora.oficinas,
        altaProyecto: aseguradora.altaProyecto,
        documentos: aseguradora.documentos,
      },
      catalagos,
    };
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.findAll
  async findAll(payload: { paginate: any }): Promise<ResponseDto> {
    const aseguradoras = await this.admAseguradoraRepository.selectAll(
      payload.paginate,
    );

    const ids = aseguradoras.docs.reduce(
      (value, aseguradoras) => {
        value.paisIds.add(aseguradoras.pais);
        value.estatusIds.add(aseguradoras.estatus);
        return value;
      },
      {
        paisIds: new Set<number>(),
        estatusIds: new Set<number>(),
      },
    );

    const [paises, estatusGenerales]: [any[], any[]] = await Promise.all([
      this.catPaisRepository.selectInByClave(Array.from(ids.paisIds)),
      this.catEstatusGeneralRepository.selectInByClave(
        Array.from(ids.estatusIds),
      ),
    ]);

    aseguradoras.docs = aseguradoras.docs.map((aseguradora) => {
      return {
        _id: aseguradora._id,
        razonSocial: aseguradora.razonSocial,
        nombreComercial: aseguradora.nombreComercial,
        pais: paises.find((_) => _.clave == aseguradora.pais),
        estatus: estatusGenerales.find((_) => _.clave == aseguradora.estatus),
        altaProyecto: aseguradora.altaProyecto,
        documentos: aseguradora.documentos,
      };
    });

    return DefaultResponse.sendOk('', aseguradoras);
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.findAllCombo
  async findAllCombo(paylaod: any) {
    const aseguradoras = await this.admAseguradoraRepository.selectAll(
      paylaod.paginate,
    );

    const ids = aseguradoras.docs.reduce(
      (value, aseguradoras) => {
        value.paisIds.add(aseguradoras.pais);
        value.estatusIds.add(aseguradoras.estatus);
        return value;
      },
      {
        paisIds: new Set<number>(),
        estatusIds: new Set<number>(),
      },
    );

    const [paises, estatusGenerales]: [any[], any[]] = await Promise.all([
      this.catPaisRepository.selectInByClave(Array.from(ids.paisIds)),
      this.catEstatusGeneralRepository.selectInByClave(
        Array.from(ids.estatusIds),
      ),
    ]);

    aseguradoras.docs = aseguradoras.docs.map((aseguradora) => {
      return {
        _id: aseguradora._id,
        razonSocial: aseguradora.razonSocial,
        nombreComercial: aseguradora.nombreComercial,
        // pais: paises.find((_) => _.clave == aseguradora.pais),
        estatus: estatusGenerales.find((_) => _.clave == aseguradora.estatus),
      };
    });

    return DefaultResponse.sendOk('', aseguradoras);
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.findAllByPais
  async findAllByPais(paylaod: any): Promise<ResponseDto> {
    const pais = await this.admAseguradoraRepository.selectByPais(
      paylaod.data.idPais,
    );

    return DefaultResponse.sendOk('', pais);
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.findAllOptionSelect
  async findAllOptionSelect(): Promise<ResponseDto> {
    const aseguradoras =
      await this.admAseguradoraRepository.selectAllOptionSelect();

    return DefaultResponse.sendOk('', aseguradoras);
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.findOne
  async findOne(payload: { id: string; lang: string }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const aseguradora = await this.admAseguradoraRepository.findOne(payload.id);

    if (!aseguradora)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'administracion.VALIDATIONS.NOT_FOUND.ASEGURADORA',
          {
            lang: payload.lang,
          },
        ),
      );

    return DefaultResponse.sendOk('', aseguradora);
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.update
  async update(payload: {
    id: any;
    data: AdmAseguradoraDto;
    lang: string;
  }): Promise<ResponseDto> {
    const aseguradora = await this.admAseguradoraRepository.findOne(
      payload.id.id,
    );

    const isModified =
      aseguradora.pais === payload.data.pais &&
      Utilities.replaceText(aseguradora.nombreComercial) ===
        Utilities.replaceText(payload.data.nombreComercial) &&
      Utilities.replaceText(aseguradora.razonSocial) ===
        Utilities.replaceText(payload.data.razonSocial);

    if (!isModified) {
      const exist = await this.admAseguradoraRepository.checkExist(
        payload.data.pais,
        payload.data.nombreComercial.trim(),
        payload.data.razonSocial.trim(),
      );

      if (exist) {
        return DefaultResponse.sendConflict(
          this.i18n.translate('administracion.VALIDATIONS.EXISTS.ASEGURADORA', {
            lang: payload.lang,
          }),
        );
      }
    }

    const updated = await this.admAseguradoraRepository.update(
      payload.id.id,
      payload.data,
    );
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
      updated,
    );
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.selectIn
  async selectIn(payload: any): Promise<AdmAseguradora[]> {
    return await this.admAseguradoraRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.existsOneByRazonSocial
  async findOneByRazonSocial(razonSocial: string): Promise<AdmAseguradora> {
    return await this.admAseguradoraRepository.existsOneByRazonSocial(
      razonSocial,
    );
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.existsOnByNombreComercial,
  async existsOnByNombreComercial(
    nombreComercial: string,
  ): Promise<AdmAseguradora> {
    return await this.admAseguradoraRepository.existsOneByNombreComercial(
      nombreComercial,
    );
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.findOneAndGetNombreComercial
  async findOneAndGetNombreComercial(id: string): Promise<AdmAseguradora> {
    return await this.admAseguradoraRepository.findOneAndGetNombreComercialById(
      id,
    );
  }

  //FIXME: RMQServices_Administracion.ASEGURADORA.containsOficinaByClave
  async containsOficinaByClave(payload: {
    id: string;
    oficina: number;
  }): Promise<boolean> {
    return await this.admAseguradoraRepository.containsOficinaByClave(
      payload.id,
      payload.oficina,
    );
  }
}
