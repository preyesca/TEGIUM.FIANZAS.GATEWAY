import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';

import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SwaggerConsts } from '../../../app/common/consts/swagger.consts';
import { JWTAuthGuard } from '../../../app/configuration/guards/jwt-auth.guard';
import { CoreComentarioService } from '../../../modules/core/domain/services/core.comentario.service';
import { CoreComentarioRequestDto } from '../helpers/dtos/core.comentario.request.dto';

@Controller(`${SwaggerConsts.CORE.controller}/comentario`)
@ApiTags(SwaggerConsts.CORE.children.COMENTARIO)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CoreComentarioController {
  constructor(private readonly coreComentarioService: CoreComentarioService) {}

  @Post()
  async create(
    @Body() data: CoreComentarioRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.coreComentarioService.create({
      data,
      lang: i18n.lang,
    });
  }

  @Get('findOne-by-folio-actividad')
  async findOne(
    @Query('folio') folio: string,
    @Query('actividad') actividad: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.coreComentarioService.findOne({
      folio,
      actividad,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  async update(
    @Param('id') idFolio: string,
    @Body() data: CoreComentarioRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.coreComentarioService.update({
      data,
      idFolio,
      lang: i18n.lang,
    });
  }
}
