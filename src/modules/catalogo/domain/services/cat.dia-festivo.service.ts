import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatGiro } from '../../persistence/database/cat.giro.schema';
import { CatDiaFestivoRepository } from '../../persistence/repository/cat.dia-festivo.repository';

@Controller()
export class CatDiaFestivoService {
  constructor(private readonly catDiaFestivoRepository: CatDiaFestivoRepository) {}

  async select(): Promise<ResponseDto> {
    const data = await this.catDiaFestivoRepository.select();
    return DefaultResponse.sendOk('', data);
  }
}
