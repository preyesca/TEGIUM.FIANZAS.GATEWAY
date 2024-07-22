import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatEstatusGeneracionFormato } from '../../persistence/database/cat.estatus-generacion-formato.schema';
import { CatEstatusGeneracionFormatosRepository } from '../../persistence/repository/cat.estatus-generacion-formatos.repository';

@Controller()
export class CatEstatusGeneracionFormatosService {
  constructor(
    private readonly catEstatusGeneracionFormatosRepository: CatEstatusGeneracionFormatosRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERACION_FORMATOS.select
  async select(): Promise<ResponseDto> {
    const data = await this.catEstatusGeneracionFormatosRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERACION_FORMATOS.finOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
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

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERACION_FORMATOS.selectIn
  async selectIn(payload: string[]): Promise<CatEstatusGeneracionFormato[]> {
    return await this.catEstatusGeneracionFormatosRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERACION_FORMATOS.selectInByClave
  async selectInByClave(
    claves: number[],
  ): Promise<CatEstatusGeneracionFormato[]> {
    return await this.catEstatusGeneracionFormatosRepository.selectInByClave(
      claves,
    );
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERACION_FORMATOS.findOneByClave
  async findOneByClave(clave: number): Promise<CatEstatusGeneracionFormato> {
    return await this.catEstatusGeneracionFormatosRepository.findOneByClave(
      clave,
    );
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_GENERACION_FORMATOS.finOneByDescription
  async findOneByDesription(
    desripcion: string,
  ): Promise<CatEstatusGeneracionFormato> {
    return await this.catEstatusGeneracionFormatosRepository.findOneByDescripcion(
      desripcion,
    );
  }
}
