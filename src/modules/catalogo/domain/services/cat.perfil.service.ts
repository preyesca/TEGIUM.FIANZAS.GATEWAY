import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { CatPerfil } from '../../persistence/database/cat.perfil.schema';
import { CatPerfilRepository } from '../../persistence/repository/cat.perfil.repository';
@Controller()
export class CatPerfilService {
  constructor(
    private readonly catPerfilRepository: CatPerfilRepository,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  //FIXME: RMQServices_Catalogo.PERFIL.select
  async select(): Promise<ResponseDto> {
    const data = await this.catPerfilRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.PERFIL.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catPerfilRepository.findOne(id);

    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.PERFIL'),
        );
  }

  //FIXME: RMQServices_Catalogo.PERFIL.getAll
  async getAll(): Promise<CatPerfil[]> {
    return await this.catPerfilRepository.getAll();
  }

  //FIXME: RMQServices_Catalogo.PERFIL.selectIn
  async selectIn(ids: string[]): Promise<CatPerfil[]> {
    return await this.catPerfilRepository.selectIn(ids);
  }

  //FIXME: RMQServices_Catalogo.PERFIL.selectInByClave
  async selectInByClave(claves: number[]): Promise<CatPerfil[]> {
    return await this.catPerfilRepository.selectInByClave(claves);
  }

  //FIXME: RMQServices_Catalogo.PERFIL.findOneByClave
  async findOneByClave(clave: number): Promise<CatPerfil> {
    return await this.catPerfilRepository.findOneByClave(clave);
  }
}
