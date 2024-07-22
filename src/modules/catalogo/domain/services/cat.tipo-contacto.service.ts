import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatTipoContacto } from '../../persistence/database/cat.tipo-contacto.schema';
import { CatTipoContactoRepository } from '../../persistence/repository/cat.tipo-contacto.repository';

@Controller()
export class CatTipoContactoService {
  constructor(
    private readonly catTipoContactoRepository: CatTipoContactoRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.TIPO_CONTACTO.select
  async select(): Promise<ResponseDto> {
    const data = await this.catTipoContactoRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.TIPO_CONTACTO.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catTipoContactoRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.TIPO_CONTACTO'),
        );
  }

  //FIXME: RMQServices_Catalogo.TIPO_CONTACTO.findOneByDescription
  async findOneByDescription(description: string): Promise<CatTipoContacto> {
    return await this.catTipoContactoRepository.findOneByDescription(
      description,
    );
  }
}