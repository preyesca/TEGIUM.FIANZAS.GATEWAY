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
import { SwaggerConsts } from '../../../../app/common/consts/swagger.consts';
import { JWTAuthGuard } from '../../../../app/configuration/guards/jwt-auth.guard';
import { FlowRecoleccionFisicosDTO } from '../../../../modules/core/domain/helpers/dto/flows/flow.recoleccion-fisicos.dto';
import { FlowRecoleccionFisicosServices } from '../../../../modules/core/domain/services/flows/flow.recoleccion-fisicos.service';

@Controller(`${SwaggerConsts.CORE.controller}/recoleccion-fisicos`)
@ApiTags(SwaggerConsts.CORE.children.RECOLECCION_FISICOS)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowRecoleccionFisicosController {
  constructor(
    private readonly flowRecoleccionFisicos: FlowRecoleccionFisicosServices,
  ) {}

  @Post()
  async create(
    @Request() req: any,
    @Body() body: FlowRecoleccionFisicosDTO,
    @I18n() i18n: I18nContext,
  ) {
    return this.flowRecoleccionFisicos.create({
      body,
      lang: i18n.lang,
      session: req.user,
    });
  }

  @Get('find-one-to-edit/:id')
  async findOneToEditRecoleccionFisicos(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Request() req: any,
  ) {
    return this.flowRecoleccionFisicos.findOneToEdit({
      id,
      lang: i18n.lang,
      session: req.user,
    });
  }
}
