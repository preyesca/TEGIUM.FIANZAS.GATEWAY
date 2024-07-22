import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatEstatusGeneracionFormato } from '../../persistence/database/cat.estatus-generacion-formato.schema';
import { CatEstatusGeneralRepository } from '../../persistence/repository/cat.estatus-general.repository';

@Controller()
export class CatEstatusGeneralService {
  constructor(
    private readonly catEstatusGeneracionFormatosRepository: CatEstatusGeneralRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERAL.select
  async select(): Promise<ResponseDto> {
    const data = await this.catEstatusGeneracionFormatosRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERAL.findOne
  async findOne(id: string, @I18n() i18n: I18nContext) {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catEstatusGeneracionFormatosRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_GENERACION_FORMATOS'),
        );
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERAL.findOneByClave
  async findOneByClave(clave: number): Promise<CatEstatusGeneracionFormato> {
    return await this.catEstatusGeneracionFormatosRepository.findOneByClave(
      clave,
    );
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERAL.selectIn
  async selectIn(ids: string[]): Promise<CatEstatusGeneracionFormato[]> {
    return await this.catEstatusGeneracionFormatosRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERAL.selectInByClave
  async selectInByClave(
    claves: number[],
  ): Promise<CatEstatusGeneracionFormato[]> {
    return await this.catEstatusGeneracionFormatosRepository.selectInByClave(
      claves,
    );
  }
}
