import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatRiesgo } from '../../persistence/database/cat.riesgo.schema';
import { CatRiesgoRepository } from '../../persistence/repository/cat.riesgo.repository';

@Controller()
export class CatRiesgoService {
  constructor(private readonly catRiesgoRepository: CatRiesgoRepository) {}

  //FIXME: RMQServices_Catalogo.RIESGO.select)
  async select(): Promise<ResponseDto> {
    const data = await this.catRiesgoRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.RIESGO.findOne)
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catRiesgoRepository.findOne(id);

    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.RIESGO'),
        );
  }

  //FIXME: RMQServices_Catalogo.RIESGO.findOneByClave)
  async findOneByClave(clave: number): Promise<CatRiesgo> {
    return await this.catRiesgoRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.RIESGO.findOneByDescription)
  async findOneByDescription(descripcion: string): Promise<CatRiesgo> {
    return await this.catRiesgoRepository.findOneByDescription(descripcion);
  }

  //FIXME: RMQServices_Catalogo.RIESGO.selectIn)
  async selectIn(ids: string[]): Promise<CatRiesgo[]> {
    return await this.catRiesgoRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Catalogo.RIESGO.selectInByClave)
  async selectInByClave(claves: number[]): Promise<CatRiesgo[]> {
    return await this.catRiesgoRepository.selectInByClave(claves);
  }
}
