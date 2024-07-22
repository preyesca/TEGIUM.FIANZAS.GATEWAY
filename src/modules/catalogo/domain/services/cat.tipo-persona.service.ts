import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatTipoPersona } from '../../persistence/database/cat.tipo-persona.schema';
import { CatTipoPersonaRepository } from '../../persistence/repository/cat.tipo-persona.repository';

@Controller()
export class CatTipoPersonaService {
  constructor(
    private readonly catTipoPersonaRepository: CatTipoPersonaRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.TIPO_PERSONA.select
  async select(): Promise<ResponseDto> {
    const data = await this.catTipoPersonaRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.TIPO_PERSONA.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catTipoPersonaRepository.findOne(id);

    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.TIPO_PERSONA'),
        );
  }

  //FIXME: RMQServices_Catalogo.TIPO_PERSONA.selectIn
  async selectIn(payload: any): Promise<CatTipoPersona[]> {
    return await this.catTipoPersonaRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Catalogo.TIPO_PERSONA.findOneByClave
  async findOneByClave(clave: number): Promise<CatTipoPersona> {
    return await this.catTipoPersonaRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.TIPO_PERSONA.selectInByClave
  async selectInByClave(claves: number[]): Promise<CatTipoPersona[]> {
    return await this.catTipoPersonaRepository.selectInByClave(claves);
  }

  //FIXME: RMQServices_Catalogo.TIPO_PERSONA.findOneByDescription
  async findOneByDescription(descripcion: string): Promise<CatTipoPersona> {
    return await this.catTipoPersonaRepository.findOneByDescription(
      descripcion,
    );
  }
}
