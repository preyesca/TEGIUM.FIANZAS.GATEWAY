import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatGiro } from '../../persistence/database/cat.giro.schema';
import { CatGiroRepository } from '../../persistence/repository/cat.giro.repository';

@Controller()
export class CatGiroService {
  constructor(private readonly catGiroRepository: CatGiroRepository) {}

  //FIXME: RMQServices_Catalogo.GIRO.select
  async select(): Promise<ResponseDto> {
    const data = await this.catGiroRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.GIRO.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catGiroRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.GIRO'),
        );
  }

  //FIXME: RMQServices_Catalogo.GIRO.selectIn
  async selectIn(payload: any): Promise<CatGiro[]> {
    return await this.catGiroRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Catalogo.GIRO.findOneByDescription
  async findOneByDesription(desripcion: string): Promise<CatGiro> {
    return await this.catGiroRepository.findOneByDescripcion(desripcion);
  }

  //FIXME: RMQServices_Catalogo.GIRO.selectInByClave
  async selectInByClave(clave: number[]): Promise<CatGiro[]> {
    return await this.catGiroRepository.selectInByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.GIRO.findOneByClave
  async findOneByClave(clave: number): Promise<CatGiro> {
    return await this.catGiroRepository.findOneByClave(clave);
  }
}
