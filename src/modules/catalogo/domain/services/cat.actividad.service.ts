import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatActividad } from '../../persistence/database/cat.actividad.schema';
import { CatActividadRepository } from '../../persistence/repository/cat.actividad.repository';

@Controller()
export class CatActividadService {
  constructor(
    private readonly catActividadRepository: CatActividadRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.ACTIVIDAD.select
  async select(): Promise<ResponseDto> {
    const data = await this.catActividadRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.ACTIVIDAD.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );
    const data = await this.catActividadRepository.findOne(id);

    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.ACTIVIDAD'),
        );
  }

  //FIXME: RMQServices_Catalogo.ACTIVIDAD.findOneByDescription
  async findOneByDesription(desripcion: string): Promise<CatActividad> {
    return await this.catActividadRepository.findOneByDescripcion(desripcion);
  }

  //FIXME: RMQServices_Catalogo.ACTIVIDAD.selectIn
  async selectIn(payload: any): Promise<CatActividad[]> {
    return await this.catActividadRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Catalogo.ACTIVIDAD.selectInByClave
  async selectInByClave(payload: any): Promise<CatActividad[]> {
    return await this.catActividadRepository.selectInByClave(payload);
  }

  //FIXME: RMQServices_Catalogo.ACTIVIDAD.findOneByClave
  async findOneByClave(clave: number): Promise<CatActividad> {
    return await this.catActividadRepository.findOneByClave(clave);
  }
}
