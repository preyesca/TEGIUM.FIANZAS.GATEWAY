import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { Utilities } from 'src/app/utils/utilities';
import { CatCategoriaDocumentoRepository } from 'src/modules/catalogo/persistence/repository/cat.categoria-documento.repository';
import { CatEstatusGeneralRepository } from 'src/modules/catalogo/persistence/repository/cat.estatus-general.repository';
import { CatPaisRepository } from 'src/modules/catalogo/persistence/repository/cat.pais.repository';
import { AdmDocumentoRepository } from '../../persistence/repository/adm.documento.repository';
import { AdmDocumentoDto } from '../dto/adm.documento.dto';

@Controller()
export class AdmDocumentoService {
  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly catCategoriaDocumentoRepository: CatCategoriaDocumentoRepository,
    private readonly catPaisRepository: CatPaisRepository,
    private readonly catEstatusGeneralRepository: CatEstatusGeneralRepository,
    private readonly admDocumentoRepository: AdmDocumentoRepository,
  ) {}

  // RMQServices_Administracion.DOCUMENTO.create)
  async create(payload: { data: AdmDocumentoDto; lang: string }) {
    const exist = await this.admDocumentoRepository.checkExist(
      payload.data.pais,
      payload.data.categoria,
      payload.data.estatus,
      payload.data.nombre.trim(),
    );
    if (exist.length > 0)
      return DefaultResponse.sendConflict(
        this.i18n.translate('all.VALIDATIONS.DATA.EXISTS.GENERAL', {
          lang: payload.lang,
        }),
        payload.data,
      );

    // *  Validación para documentos tipos sistemas que tienen una clave
    if (payload.data.clave != '' && payload.data.categoria === 4) {
      const existByClave = await this.admDocumentoRepository.findByClave(
        payload.data.clave,
      );
      if (existByClave)
        return {
          success: false,
          message: this.i18n.translate('all.VALIDATIONS.DATA.EXISTS.GENERAL', {
            lang: payload.lang,
          }),
          data: payload.data,
        };
    }

    payload.data.nombreBase = Utilities.convertToBaseNamePath(
      payload.data.nombre,
    );
    const created = await this.admDocumentoRepository.create(payload.data);
    return {
      success: true,
      message: this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      data: created,
    };
  }

  //FIXME: RMQServices_Administracion.DOCUMENTO.findAllOptionSelect
  async findAllOptionSelect(paylaod: any): Promise<ResponseDto> {
    const documentos =
      await this.admDocumentoRepository.selectAllOptionSelect();
    return DefaultResponse.sendOk('', documentos);
  }

  //TODO: RMQServices_Administracion.DOCUMENTO.findAll
  async findAll(paylaod: any): Promise<ResponseDto> {
    const Documentos = await this.admDocumentoRepository.selectAll(
      paylaod.paginate,
    );

    //Obtiene los Ids de paises y los estableces en un arreglo  diferenciandolos
    const paisesFiltro: any[] = [
      ...new Set(Documentos.docs.map(({ pais }) => pais)),
    ];
    const estatusFiltro: any[] = [
      ...new Set(Documentos.docs.map(({ estatus }) => estatus)),
    ];

    const categoriaFiltro: any[] = [
      ...new Set(Documentos.docs.map(({ categoria }) => categoria)),
    ];

    const [paises, categorias, estatusGenerales] = await Promise.all([
      this.catPaisRepository.selectInByClave(paisesFiltro),
      this.catCategoriaDocumentoRepository.selectInByClave(categoriaFiltro),
      this.catEstatusGeneralRepository.selectInByClave(estatusFiltro),
    ]);

    Documentos.docs = Documentos.docs.map((doc: any) => {
      return {
        _id: doc._id,
        pais: paises.find((x) => x.clave === doc.pais)?.descripcion,
        categoria: categorias.find((x) => x.clave === doc.categoria),
        estatus: estatusGenerales.find((x) => x.clave === doc.estatus),
        nombre: doc.nombre,
        nombrebase: doc.nombreBase,
        activo: doc.activo,
      };
    });

    return DefaultResponse.sendOk('', Documentos);
  }

  //TODO: RMQServices_Administracion.DOCUMENTO.paginate
  async paginateAll(
    paginateParams: IPaginateParams,
    lang: string,
  ): Promise<ResponseDto> {
    const CategoriasDocumentos =
      await this.catCategoriaDocumentoRepository.select();

    const categoriasFilter = CategoriasDocumentos.filter(
      (x) =>
        x.descripcion
          .toLowerCase()
          .search(paginateParams.search.toLowerCase()) >= 0,
    ).map((x) => {
      return x.clave;
    });

    const Documentos = await this.admDocumentoRepository.selectAll(
      paginateParams,
      categoriasFilter,
    );

    //Obtiene los Ids de paises y los estableces en un arreglo  diferenciandolos
    const paisesFiltro: any[] = [
      ...new Set(Documentos.docs.map(({ pais }) => pais)),
    ];
    const estatusFiltro: any[] = [
      ...new Set(Documentos.docs.map(({ estatus }) => estatus)),
    ];
    const categoriaFiltro: any[] = [
      ...new Set(Documentos.docs.map(({ categoria }) => categoria)),
    ];

    const [paises, categorias, estatusGenerales] = await Promise.all([
      this.catPaisRepository.selectInByClave(paisesFiltro),
      this.catCategoriaDocumentoRepository.selectInByClave(categoriaFiltro),
      this.catEstatusGeneralRepository.selectInByClave(estatusFiltro),
    ]);

    Documentos.docs = Documentos.docs.map((doc: any) => {
      return {
        _id: doc._id,
        pais: paises.find((x) => x.clave === doc.pais)?.descripcion,
        paisIcon: paises.find((x) => x.clave === doc.pais)?.icon,
        categoria: categorias.find((x) => x.clave === doc.categoria)
          ?.descripcion,
        estatus: estatusGenerales.find((x) => x.clave === doc.estatus)
          ?.descripcion,
        nombre: doc.nombre,
        activo: doc.activo,
      };
    });

    return DefaultResponse.sendOk('', Documentos);
  }

  // RMQServices_Administracion.DOCUMENTO.findOneToEdit)
  async findOneToEdit(payload: { id: string; lang: string }) {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );
    const documento = await this.admDocumentoRepository.findOne(payload.id);
    if (!documento)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
      );

    /* const paises = (
      await lastValueFrom(
        this._clientProxyCatalogo.send(RMQServices_Catalogo.PAIS.select, {}),
      )
    )?.data; */
    const paises = await this.catPaisRepository.select();

    /* const categorias = (
      await lastValueFrom(
        this._clientProxyCatalogo.send(
          RMQServices_Catalogo.CATEGORIA_DOCUMENTO.select,
          {},
        ),
      )
    )?.data; */
    const categorias = await this.catCategoriaDocumentoRepository.select();

    /* const estatus = (
      await lastValueFrom(
        this._clientProxyCatalogo.send(
          RMQServices_Catalogo.ESTATUS_GENERAL.select,
          {},
        ),
      )
    )?.data; */
    const estatus = await this.catEstatusGeneralRepository.select();

    const data: any = {
      documento: {
        nombre: documento.nombre,
        nombrebase: documento.nombreBase,
        activo: documento.activo,
        clave: documento.clave,
        pais: paises?.find((p: any) => p.clave === documento.pais)?.clave,
        categoria: categorias?.find((p: any) => p.clave === documento.categoria)
          ?.clave,
        estatus: estatus?.find((p: any) => p.clave === documento.estatus)
          ?.clave,
      },
      catalogo: {
        paises: paises,
        estatus: estatus,
        categorias: categorias,
      },
    };

    return { success: true, message: '', data: data };
  }

  // RMQServices_Administracion.DOCUMENTO.findOne)
  async selectOne(id: string): Promise<ResponseDto> {
    const found = await this.admDocumentoRepository.findOne(id);

    const [pais, categoria, estatus] = await Promise.all([
      await this.catPaisRepository.findOneByClave(found.pais),
      await this.catCategoriaDocumentoRepository.findOneByClave(
        found.categoria,
      ),
      await this.catEstatusGeneralRepository.findOneByClave(found.estatus),
    ]);

    const documento = { ...found, pais, categoria, estatus };

    return DefaultResponse.sendOk('', documento);
  }

  // RMQServices_Administracion.DOCUMENTO.update)
  async update(payload: { id: any; data: AdmDocumentoDto; lang: string }) {
    const exist = await this.admDocumentoRepository.checkExist(
      payload.data.pais,
      payload.data.categoria,
      payload.data.estatus,
      payload.data.nombre.trim(),
    );

    if (exist.length > 0)
      return DefaultResponse.sendConflict(
        this.i18n.translate('all.VALIDATIONS.DATA.EXISTS.GENERAL', {
          lang: payload.lang,
        }),
        payload.data,
      );

    payload.data.nombreBase = Utilities.convertToBaseNamePath(
      payload.data.nombre,
    );

    const updated = await this.admDocumentoRepository.update(
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

  // RMQServices_Administracion.DOCUMENTO.selectIn)
  async selectIn(payload) {
    const resp = await this.admDocumentoRepository.selectIn(payload);
    const categorias = [...new Set(resp.map(({ categoria }) => categoria))];
    /* const [categoriasDocumentos] = await Promise.all([
      await lastValueFrom(
        this._clientProxyCatalogo.send(
          RMQServices_Catalogo.CATEGORIA_DOCUMENTO.selectInByClave,
          categorias,
        ),
      ),
    ]); */
    const [categoriasDocumentos] = await Promise.all([
      await this.catCategoriaDocumentoRepository.selectInByClave(categorias),
    ]);
    const data = resp.map((doc: any) => {
      return {
        _id: doc._id,
        nombre: doc.nombre,
        nombrebase: doc.nombreBase,
        categoriaData: categoriasDocumentos.find(
          (x) => x.clave === doc.categoria,
        ),
        activo: doc.activo,
        pais: doc.pais,
        categoria: doc.categoria,
        estatus: doc.estatus,
      };
    });
    return data;
  }

  // RMQServices_Administracion.DOCUMENTO.findAllByPais)
  async findAllDocumentosByPais(payload: { pais }) {
    return await this.admDocumentoRepository.findAllDocumentosByPais(
      Number(payload.pais),
    );
  }

  // RMQServices_Administracion.DOCUMENTO.findByClave)
  async findByClave(payload: { clave:string,lang: string }) {
	  const documento = await this.admDocumentoRepository.findByClave(payload.clave);
	  if (!documento)
		  return DefaultResponse.sendNotFound(
			  this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
				  lang: payload.lang,
			  }),
		  );
    return { success: true, message: '', data: documento };
  }
}
