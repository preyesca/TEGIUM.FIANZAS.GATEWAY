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
import { Types } from 'mongoose';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { FlowValidacionAfianzadoraService } from 'src/modules/core/domain/services/flows/flow.validacion-afianzadora.service';
import { FlowValidacionAfianzadoraDto } from 'src/modules/core/domain/helpers/dto/flows/flow.validacion-afianzadora.dto';

@Controller(`${SwaggerConsts.CORE.controller}/validacion-afianzadora`)
@ApiTags(SwaggerConsts.CORE.children.VALIDACION_AFIANZADORA)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowValidacionAfianzadoraController {
  constructor(
    private readonly flowValidacionAfianzadoraService: FlowValidacionAfianzadoraService,
  ) {}

    
  @Post()
  async create(@Body() body: FlowValidacionAfianzadoraDto, @I18n() i18n: I18nContext) {
    return this.flowValidacionAfianzadoraService.create(
      // RMQServices_Core.VALIDACION_AFIANZADORA.create,
      {
        body,
        lang: i18n.lang,
      },
    );
  }

  @Get('get-catalogs/:titular')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getCatalogs(@Request() req: any, 
  @Param('titular') titular: string,
  @I18n() i18n: I18nContext) {
    return this.flowValidacionAfianzadoraService.getCatalogosToCreate(
      // RMQServices_Core.VALIDACION_AFIANZADORA.getCatalogosToCreate,
      {
        session: req?.user,
        lang: i18n.lang,
      },
    );
  }

  @Get('find-one-to-edit/:id')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findOneToEdit(
    @Request() req: any,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    return this.flowValidacionAfianzadoraService.findOneToEdit(
      // RMQServices_Core.VALIDACION_AFIANZADORA.findOneToEdit,
      {
        id,
        session: req?.user,
        lang: i18n.lang,
      },
    );
  }

  @Put(':id')
  async update(
    @Param() id: string,
    @Body() data: FlowValidacionAfianzadoraDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.flowValidacionAfianzadoraService.update(
      // RMQServices_Core.VALIDACION_AFIANZADORA.update,
      {
        id: id,
        data: data,
        lang: i18n.lang,
      },
    );
  }
}
