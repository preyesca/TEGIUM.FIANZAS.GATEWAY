import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatProceso } from '../../persistence/database/cat.proceso.schema';
import { CatProcesoRepository } from '../../persistence/repository/cat.proceso.repository';

@Controller()
export class CatProcesoService {
  constructor(private readonly catProcesoRepository: CatProcesoRepository) {}

  //FIXME: RMQServices_Catalogo.PROCESO.select
  async select(): Promise<ResponseDto> {
    const data = await this.catProcesoRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.PROCESO.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catProcesoRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.PROCESO'),
        );
  }

  //FIXME: RMQServices_Catalogo.PROCESO.findOneByClave
  async findOneByClave(clave: number): Promise<CatProceso> {
    return await this.catProcesoRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.PROCESO.selectIn
  async selectIn(ids: string[]): Promise<CatProceso[]> {
    return await this.catProcesoRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Catalogo.PROCESO.selectInByClave
  async selectInByClave(claves: number[]): Promise<CatProceso[]> {
    return await this.catProcesoRepository.selectInByClave(claves);
  }
}
