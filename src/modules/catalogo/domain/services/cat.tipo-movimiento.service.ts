import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatTipoMovimiento } from '../../persistence/database/cat.tipo-movimiento.schema';
import { CatTipoMovimientoRepository } from '../../persistence/repository/cat.tipo-movimiento.repository';

@Controller()
export class CatTipoMovimientoService {
  constructor(
    private readonly catTipoMovimientoRepository: CatTipoMovimientoRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.TIPO_MOVIMIENTO.select
  async select(): Promise<ResponseDto> {
    const data = await this.catTipoMovimientoRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.TIPO_MOVIMIENTO.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catTipoMovimientoRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.TIPO_MOVIMIENTO'),
        );
  }

  //FIXME: RMQServices_Catalogo.TIPO_MOVIMIENTO.findOneByDescription
  async findOneByDesription(desripcion: string): Promise<CatTipoMovimiento> {
    return await this.catTipoMovimientoRepository.findOneByDescripcion(
      desripcion,
    );
  }

  //FIXME: RMQServices_Catalogo.TIPO_MOVIMIENTO.findOneByClave
  async findOneByClave(clave: number): Promise<CatTipoMovimiento> {
    return await this.catTipoMovimientoRepository.findOneByClave(clave);
  }
}
