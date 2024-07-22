import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatCategoriaDocumento } from '../../persistence/database/cat.categoria-documento.schema';
import { CatCategoriaDocumentoRepository } from '../../persistence/repository/cat.categoria-documento.repository';

@Controller()
export class CatCategoriaDocumentoService {
  constructor(
    private readonly catCategoriaDocumentoRepository: CatCategoriaDocumentoRepository,
  ) {}

  async select(): Promise<ResponseDto> {
    const data = await this.catCategoriaDocumentoRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catCategoriaDocumentoRepository.findOne(id);

    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.CATEGORIA_DOCUMENTO'),
        );
  }

  async selectIn(payload: any): Promise<CatCategoriaDocumento[]> {
    return await this.catCategoriaDocumentoRepository.selectIn(payload);
  }

  async selectInByClave(claves: number[]): Promise<CatCategoriaDocumento[]> {
    return await this.catCategoriaDocumentoRepository.selectInByClave(claves);
  }
}
