import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatEstatusContactoTelefonico } from '../../persistence/database/cat.estatus-contacto-telefonico.schema';
import { CatEstatusContactoTelefonicoRepository } from '../../persistence/repository/cat.estatus-contacto-telefonico.repository';

@Controller()
export class CatEstatusContactoTelefonicoService {
  constructor(
    private readonly catEstatusContactoTelefonicoRepository: CatEstatusContactoTelefonicoRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.ESTATUS_CONTACTO_TELEFONICO.select
  async select(): Promise<ResponseDto> {
    const data = await this.catEstatusContactoTelefonicoRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_CONTACTO_TELEFONICO.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catEstatusContactoTelefonicoRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_CONTACTO_TELEFONICO'),
        );
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_CONTACTO_TELEFONICO.findOneByClave
  async findOneByClave(clave: number): Promise<CatEstatusContactoTelefonico> {
    return await this.catEstatusContactoTelefonicoRepository.findOneByClave(
      clave,
    );
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_CONTACTO_TELEFONICO.selectIn
  async selectIn(ids: string[]): Promise<CatEstatusContactoTelefonico[]> {
    return await this.catEstatusContactoTelefonicoRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_CONTACTO_TELEFONICO.selectInByClave
  async selectInByClave(payload: any): Promise<CatEstatusContactoTelefonico[]> {
    return await this.catEstatusContactoTelefonicoRepository.selectInByClave(
      payload,
    );
  }
}
