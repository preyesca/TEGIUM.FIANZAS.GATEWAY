import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { FlowListaNegraService } from 'src/modules/core/domain/services/flows/flow.lista-negra.service';

import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { CreateFolioAutorizadoRequestDto } from '../../helpers/dtos/flows/flow.lista-negra.request.dto';

@Controller(`${SwaggerConsts.CORE.controller}/lista-negra`)
@ApiTags(SwaggerConsts.CORE.children.LISTA_NEGRA)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowListaNegraController {
  constructor(private readonly flowListaNegraService: FlowListaNegraService) {}

  @Post()
  async create(
    @Body() body: CreateFolioAutorizadoRequestDto,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ) {
    return this.flowListaNegraService.create({
      body,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-folio-autorizado/:id')
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return this.flowListaNegraService.findOne({
      id,
      lang: i18n.lang,
    });
  }

  @Get('findAll')
  async findAll(@Request() req: any, @I18n() i18n: I18nContext) {
    return this.flowListaNegraService.findAll({
      lang: i18n.lang,
      session: req?.user,
      paginateParams: req?.paginate,
    });
  }
}
