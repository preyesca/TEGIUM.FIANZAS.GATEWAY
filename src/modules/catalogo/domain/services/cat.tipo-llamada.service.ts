import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatTipoLlamadaRepository } from '../../persistence/repository/cat.tipo-llamada.repository';

@Controller()
export class CatTipoLlamadaService {
  constructor(
    private readonly catTipoLlamadaRepository: CatTipoLlamadaRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.TIPO_LLAMADA.select
  async select(): Promise<ResponseDto> {
    const data = await this.catTipoLlamadaRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.TIPO_LLAMADA.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catTipoLlamadaRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.TIPO_LLAMADA'),
        );
  }

  //FIXME: RMQServices_Catalogo.TIPO_LLAMADA.findOneByClave
  async findOneByClave(clave: number) {
    return await this.catTipoLlamadaRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.TIPO_LLAMADA.selectIn
  async selectIn(payload: any) {
    return await this.catTipoLlamadaRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Catalogo.TIPO_LLAMADA.selectInByClave
  async selectInByClave(clave: number) {
    return await this.catTipoLlamadaRepository.selectInByClave(clave);
  }
}
