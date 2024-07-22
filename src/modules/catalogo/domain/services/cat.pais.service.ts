import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatPais } from '../../persistence/database/cat.pais.schema';
import { CatPaisRepository } from '../../persistence/repository/cat.pais.repository';

@Controller()
export class CatPaisService {
  constructor(private readonly catPaisRepository: CatPaisRepository) {}

  async select(): Promise<ResponseDto> {
    const data = await this.catPaisRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  async findOne(id: string, i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catPaisRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.PAIS'),
        );
  }

  async findOneByClave(clave: number): Promise<CatPais> {
    return await this.catPaisRepository.findOneByClave(clave);
  }

  async selectIn(payload: string[]): Promise<CatPais[]> {
    return await this.catPaisRepository.selectIn(payload);
  }

  async selectInByClave(claves: number[]): Promise<CatPais[]> {
    return await this.catPaisRepository.selectInByClave(claves);
  }
}
