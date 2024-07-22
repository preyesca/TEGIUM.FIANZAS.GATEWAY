import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatNegocio } from '../../persistence/database/cat.negocio.schema';
import { CatNegocioRepository } from '../../persistence/repository/cat.negocio.repository';

@Controller()
export class CatNegocioService {
  constructor(private readonly catNegocioRepository: CatNegocioRepository) {}

  //FIXME: RMQServices_Catalogo.NEGOCIO.select
  async select(): Promise<ResponseDto> {
    const data = await this.catNegocioRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME RMQServices_Catalogo.NEGOCIO.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catNegocioRepository.findOne(id);

    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.NEGOCIO'),
        );
  }

  //FIXME: RMQServices_Catalogo.NEGOCIO.findOneByClave
  async findOneByClave(clave: number): Promise<CatNegocio> {
    return await this.catNegocioRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.NEGOCIO.selectIn
  async selectIn(ids: string[]): Promise<CatNegocio[]> {
    return await this.catNegocioRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Catalogo.NEGOCIO.selectInByClave
  async selectInByClave(claves: number[]): Promise<CatNegocio[]> {
    return await this.catNegocioRepository.selectInByClave(claves);
  }
}
