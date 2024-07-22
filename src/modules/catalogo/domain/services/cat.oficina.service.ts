import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatOficina } from '../../persistence/database/cat.oficina.schema';
import { CatOficinaRepository } from '../../persistence/repository/cat.oficina.repository';

@Controller()
export class CatOficinaService {
  constructor(private readonly catOficinaRepository: CatOficinaRepository) {}

  //FIXME: RMQServices_Catalogo.OFICINA.select
  async select(): Promise<ResponseDto> {
    const data = await this.catOficinaRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.OFICINA.finOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catOficinaRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.OFICINA'),
        );
  }

  //FIXME: RMQServices_Catalogo.OFICINA.findOneByClave
  async findOneByClave(clave: number): Promise<CatOficina> {
    return await this.catOficinaRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.OFICINA.findOneByDescripcion
  async findOneByDescripcion(descripcion: string): Promise<CatOficina> {
    return await this.catOficinaRepository.findOneByDescripcion(descripcion);
  }

  //FIXME: RMQServices_Catalogo.OFICINA.selectIn
  async selectIn(payload: string[]): Promise<CatOficina[]> {
    return await this.catOficinaRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Catalogo.OFICINA.selectInByClave
  async selectInByClave(claves: number[]): Promise<CatOficina[]> {
    return await this.catOficinaRepository.selectInByClave(claves);
  }
}
