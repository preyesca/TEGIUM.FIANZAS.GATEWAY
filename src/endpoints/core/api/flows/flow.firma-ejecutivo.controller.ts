import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { FlowFirmaEjecutivoDto } from 'src/modules/core/domain/helpers/dto/flows/flow.firma-ejecutivo.dto';
import { FlowFirmaEjecutivoService } from 'src/modules/core/domain/services/flows/flow.firma-ejecutivo.service';

@Controller(`${SwaggerConsts.CORE.controller}/firma-ejecutivo`)
@ApiTags(SwaggerConsts.CORE.children.FIRMA_EJECUTIVO)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowFirmaEjecutivoController {
  constructor(
    private readonly flowFirmaEjecutivoService: FlowFirmaEjecutivoService,
  ) {}

  @Post()
  async create(
    @Body() body: FlowFirmaEjecutivoDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return this.flowFirmaEjecutivoService.create({
      body,
      lang: i18n.lang,
    });
  }

  @Get('get-catalogs/:titular')
  async getCatalogs(
    @Request() req: any,
    @Param('titular') titular: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return this.flowFirmaEjecutivoService.getCatalogosToCreate({
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-one-to-edit/:id')
  async findOneToEdit(
    @Request() req: any,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return this.flowFirmaEjecutivoService.findOneToEdit({
      id,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  async update(
    @Param() id: string,
    @Body() data: FlowFirmaEjecutivoDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return this.flowFirmaEjecutivoService.update({
      id: id,
      data: data,
      lang: i18n.lang,
    });
  }
}
