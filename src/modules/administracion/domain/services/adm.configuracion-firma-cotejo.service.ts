import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { CatPaisRepository } from '../../../catalogo/persistence/repository/cat.pais.repository';
import { AdmConfiguracionFirmaCotejo } from '../../persistence/database/adm.configuracion-firma-cotejo.schema';
import { AdmConfiguracionFirmaCotejoRepository } from '../../persistence/repository/adm.configuracion-firma-cotejo.repository';
import { AdmProyectoRepository } from '../../persistence/repository/adm.proyecto.repository';
import { AdmEjecutivo } from '../dto/adm.configuracion-firma-cotejo.dto';

@Controller()
export class AdmConfiguracionFirmaCotejoService {
  constructor(
    private readonly service: AdmConfiguracionFirmaCotejoRepository,
    private i18n: I18nService<I18nTranslations>,
    private readonly proyectoService: AdmProyectoRepository,
    private readonly catPaisRepository: CatPaisRepository,
  ) {}

  async paginate(payload: {
    paginateParams: IPaginateParams;
    lang: string;
  }): Promise<ResponseDto> {
    const data = await this.service.selectPaginate(payload.paginateParams);
    const proyectosIds = data.docs.map((x) => x.proyecto);
    const proyectos = await this.proyectoService.selectIn(
      Array.from(proyectosIds),
    );
    const paisesIds = proyectos.map((x) => x.pais);
    const paises = await this.catPaisRepository.selectInByClave(
      Array.from(paisesIds),
    );
    data.docs = data.docs.map((element) => {
      const proyecto = proyectos.find(
        (x: any) => x._id == String(element.proyecto),
      );
      return {
        _id: element._id,
        paisIcon: paises.find((x) => x.clave === proyecto.pais)?.icon,
        paisDescripcion: paises.find((x) => x.clave === proyecto.pais)
          ?.descripcion,
        proyecto: proyecto.codigo,
        idProyecto: proyecto._id,
      };
    });
    return DefaultResponse.sendOk('', data);
  }

  async selectAll(): Promise<ResponseDto> {
    const data = await this.service.selectAll();
    const proyectosIds = data.map((x) => x.proyecto.toString());
    const proyectos = await this.proyectoService.selectIn(
      Array.from(proyectosIds),
    );
    const paisesIds = proyectos.map((x) => x.pais);
    const paises = await this.catPaisRepository.selectInByClave(
      Array.from(paisesIds),
    );
    const result = data.map((element) => {
      const proyecto = proyectos.find(
        (x: any) => x._id == String(element.proyecto),
      );
      return {
        _id: element._id,
        paisIcon: paises.find((x) => x.clave === proyecto.pais)?.icon,
        paisDescripcion: paises.find((x) => x.clave === proyecto.pais)
          ?.descripcion,
        proyecto: proyecto.codigo,
        idProyecto: proyecto._id,
        ejecutivos: element.ejecutivos
      };
    });
    return DefaultResponse.sendOk('', result);
  }

  async selectById(payload: {
    id: string;
    lang: string;
  }): Promise<ResponseDto> {
    const data = await this.service.selectById(payload.id);
    const proyecto = await this.proyectoService.findOne(
      data[0]?.proyecto.toString(),
    );
    const paises = await this.catPaisRepository.findOneByClave(proyecto.pais);

    const result = {
      _id: data[0]?._id,
      paisIcon: paises.icon,
      paisDescripcion: paises.descripcion,
      proyecto: proyecto.codigo,
      idProyecto: proyecto._id,
    };

    return DefaultResponse.sendOk('', result);
  }

  async selectByProyecto(payload: { proyecto: string; lang: string }) {
    const data = await this.service.selectByProyecto(payload.proyecto);
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS', { lang: payload.lang }),
      data,
    );
  }

  async findEjecutivoByClave(payload: { data: any; lang: string }) {
    console.log("🚀 ~ AdmConfiguracionFirmaCotejoService ~ findEjecutivoByClave ~ payload:", payload)
    const data = await this.service.findEjecutivoByClave(
      payload.data.proyecto,
      Number(payload.data.clave),
    );
    console.log("🚀 ~ AdmConfiguracionFirmaCotejoService ~ findEjecutivoByClave ~ data:", data)
    if (!data)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
      );
    const findData = data.ejecutivos.find((x) => x.clave == payload.data.clave);
    const result = {
      numeroCliente: findData.clave,
      pathFirma: findData.path,
      firma: findData.firma
    };
    return DefaultResponse.sendOk('', result);
  }

  async create(payload: { data: AdmConfiguracionFirmaCotejo; lang: string }) {
    const data = payload.data;
    data.proyecto = new Types.ObjectId(data.proyecto);
    data.ejecutivos.forEach((element) => {
      element._id = new Types.ObjectId();
    });

    if (
      await this.service.existsByProyectoFirmaCotejo(
        data.proyecto,
      )
    )
      return DefaultResponse.sendConflict(
        this.i18n.translate(
          'administracion.VALIDATIONS.EXISTS.CONFIGURACION_FIRMA_COTEJO',
          {
            lang: payload.lang,
          },
        ),
      );

    const result = await this.service.create(data);
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', { lang: payload.lang }),
      result,
    );
  }

  async deleteFirma(payload: { data: any; lang: string }) {
    const data = await this.service.selectByProyecto(payload.data.proyecto);
    data.ejecutivos = data.ejecutivos.filter(
      (x) => x._id != payload.data.idFirma,
    );

    await this.service.update(data._id, data);
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.DELETED', {
        lang: payload.lang,
      }),
      data,
    );
  }

  async update(payload: { data: any; lang: string }) {
    const data = payload.data;
    const ejecutivo = {
      _id: new Types.ObjectId(),
      clave: data.clave,
      nombre: data.nombre,
      firma: data.firma,
      path: data.path,
      contentType: data.contentType,
      originalName: data.originalName
    };
    let dataConfiguracion = await this.service.selectByProyecto(data.proyecto);
    dataConfiguracion.ejecutivos.push(ejecutivo);
    const result = await this.service.update(
      dataConfiguracion._id,
      dataConfiguracion,
    );
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', { lang: payload.lang }),
      result,
    );
  }
}
