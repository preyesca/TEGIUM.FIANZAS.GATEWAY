import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatRamo } from '../../persistence/database/cat.ramo.schema';
import { CatRamoRepository } from '../../persistence/repository/cat.ramo.repository';

@Controller()
export class CatRamoService {
  constructor(private readonly catRamoRepository: CatRamoRepository) {}

  //FIXME: RMQServices_Catalogo.RAMO.select
  async select(): Promise<ResponseDto> {
    const data = await this.catRamoRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.RAMO.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catRamoRepository.findOne(id);

    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.RAMO'),
        );
  }

  //FIXME: RMQServices_Catalogo.RAMO.findOneByClave
  async findOneByClave(clave: number): Promise<CatRamo> {
    return await this.catRamoRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.RAMO.selectIn
  async selectIn(ids: string[]): Promise<CatRamo[]> {
    return await this.catRamoRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Catalogo.RAMO.selectInByClave
  async selectInByClave(claves: number[]): Promise<CatRamo[]> {
    return await this.catRamoRepository.selectInByClave(claves);
  }
}
