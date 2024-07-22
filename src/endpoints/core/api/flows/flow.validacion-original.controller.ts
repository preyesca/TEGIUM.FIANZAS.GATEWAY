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
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { FlowValidacionOriginalService } from 'src/modules/core/domain/services/flows/flow.validacion-original.service';
import { FlowValidacionOriginalDto } from '../../helpers/dtos/flows/flow.validacion-original.request.dto';

@Controller(`${SwaggerConsts.CORE.controller}/validacion-originales`)
@ApiTags(SwaggerConsts.CORE.children.VALIDACION_ORIGINAL)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowValidacionOriginalController {
  constructor(
    private readonly flowValidacionOriginalService: FlowValidacionOriginalService,
  ) { }

  @Post()
  async create(@Body() body: FlowValidacionOriginalDto, @I18n() i18n: I18nContext) {
    return await this.flowValidacionOriginalService.create({
      body,
      lang: i18n.lang,
    });
  }

  @Get('get-catalogs/:titular')
  async findAll(
    @Request() req: any,
    @Param('titular') titular: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.flowValidacionOriginalService.getCatalogosToCreate(
      {
        // titular,// Revisar no se usa esta variable en el service,tampoco tiene respuesta....
        session: req?.user,
        lang: i18n.lang,
      },
    );
  }

  @Get('find-one-to-edit/:id')
  async findOneToEdit(
    @Request() req: any,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.flowValidacionOriginalService.findOneToEdit(
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
    @Body() data: FlowValidacionOriginalDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.flowValidacionOriginalService.update({
      id,
      data,
      lang: i18n.lang,
    });
  }
}
