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
import { FlowValidacionFirmaService } from 'src/modules/core/domain/services/flows/flow.validacion-firma.service';
import { FlowValidacionDigitalRequestDto } from '../../helpers/dtos/flows/flow.validacion-digital.request.dto';
import { FlowValidacionFirmaRequestDto } from '../../helpers/dtos/flows/flow.validacion-firma.request.dto';

@Controller(`${SwaggerConsts.CORE.controller}/validacion-firmas`)
@ApiTags(SwaggerConsts.CORE.children.VALIDACION_FIRMA)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowValidacionFirmaController {
  constructor(
    private readonly flowValidacionFirmaService: FlowValidacionFirmaService,
  ) { }

  @Post()
  async create(
    @Body() body: FlowValidacionFirmaRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowValidacionFirmaService.create({
      body,
      lang: i18n.lang,
    });
  }

  @Get('get-catalogs/:titular')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getCatalogs(
    @Request() req: any,
    @Param('titular') titular: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowValidacionFirmaService.getCatalogosToCreate({
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-one-to-edit/:id')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findOneToEdit(
    @Request() req: any,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowValidacionFirmaService.findOneToEdit({
      id,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  async update(
    @Param() id: string,
    @Body() data: FlowValidacionDigitalRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowValidacionFirmaService.update({
      id,
      data,
      lang: i18n.lang,
    });
  }
}
