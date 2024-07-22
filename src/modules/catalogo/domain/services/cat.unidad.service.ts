import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatUnidad } from '../../persistence/database/cat.unidad.schema';
import { CatUnidadRepository } from '../../persistence/repository/cat.unidad.repository';

@Controller()
export class CatUnidadService {
  constructor(private readonly catUnidadRepository: CatUnidadRepository) {}

  //FIXME: RMQServices_Catalogo.UNIDAD.select
  async select(): Promise<ResponseDto> {
    const data = await this.catUnidadRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.UNIDAD.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catUnidadRepository.findOne(id);

    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.UNIDAD'),
        );
  }

  //FIXME: RMQServices_Catalogo.UNIDAD.findOneByClave
  async findOneByClave(clave: number): Promise<CatUnidad> {
    return await this.catUnidadRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.UNIDAD.findOneByDescription
  async findOneByDescription(description: string): Promise<CatUnidad> {
    return await this.catUnidadRepository.findOneByDescription(description);
  }

  //FIXME: RMQServices_Catalogo.UNIDAD.selectIn
  async selectIn(ids: string[]): Promise<CatUnidad[]> {
    return await this.catUnidadRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Catalogo.UNIDAD.selectInByClave
  async selectInByClave(claves: number[]): Promise<CatUnidad[]> {
    return await this.catUnidadRepository.selectInByClave(claves);
  }
}
