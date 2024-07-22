import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatEstatusActividad } from '../../persistence/database/cat.estatus-actividad.schema';
import { CatEstatusActividadRepository } from '../../persistence/repository/cat.estatus-actividad.repository';

@Controller()
export class CatEstatusActividadService {
  constructor(
    private readonly catEstatusActividadRepository: CatEstatusActividadRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.ESTATUS_ACTIVIDAD.select
  async select(): Promise<ResponseDto> {
    const data = await this.catEstatusActividadRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_ACTIVIDAD.findOne
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catEstatusActividadRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_ACTIVIDAD'),
        );
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_ACTIVIDAD.selectIn
  async selectIn(payload: any): Promise<CatEstatusActividad[]> {
    return await this.catEstatusActividadRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_ACTIVIDAD.selectInByClave
  async selectInByClave(payload: any): Promise<CatEstatusActividad[]> {
    return await this.catEstatusActividadRepository.selectInByClave(payload);
  }
}
