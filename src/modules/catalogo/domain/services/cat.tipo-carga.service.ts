import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatTipoCarga } from '../../persistence/database/cat.tipo-carga.schema';
import { CatTipoCargaRepository } from '../../persistence/repository/cat.tipo-carga.repository';

@Controller()
export class CatTipoCargaService {
  constructor(
    private readonly catTipoCargaRepository: CatTipoCargaRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.TIPO_CARGA.select
  async select(): Promise<ResponseDto> {
    const data = await this.catTipoCargaRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.TIPO_CARGA.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catTipoCargaRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.TIPO_CARGA'),
        );
  }

  //FIXME: RMQServices_Catalogo.TIPO_CARGA.findOneByDescription
  async findOneByDesription(desripcion: string): Promise<CatTipoCarga> {
    return await this.catTipoCargaRepository.findOneByDescripcion(desripcion);
  }

  //FIXME: RMQServices_Catalogo.TIPO_CARGA.findOneByClave
  async findOneByClave(clave: number): Promise<CatTipoCarga> {
    return await this.catTipoCargaRepository.findOneByClave(clave);
  }
}
