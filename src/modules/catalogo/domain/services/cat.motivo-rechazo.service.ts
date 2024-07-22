import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatMotivoRechazo } from '../../persistence/database/cat.motivo-rechazo.schema';
import { CatMotivoRechazoRepository } from '../../persistence/repository/cat.motivo-rechazo.repository';

@Controller()
export class CatMotivoRechazoService {
  constructor(
    private readonly catMotivoRechazoRepository: CatMotivoRechazoRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.MOTIVO_RECHAZO.select
  async select(): Promise<ResponseDto> {
    const data = await this.catMotivoRechazoRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.MOTIVO_RECHAZO.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catMotivoRechazoRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.MOTIVO_RECHAZO'),
        );
  }

  //FIXME: RMQServices_Catalogo.MOTIVO_RECHAZO.selectInByClave
  async selectInByClave(claves: number[]): Promise<CatMotivoRechazo[]> {
    return await this.catMotivoRechazoRepository.selectInByClave(claves);
  }
}
