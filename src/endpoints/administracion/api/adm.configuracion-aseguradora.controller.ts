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
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { AdmConfiguracionAseguradoraService } from 'src/modules/administracion/domain/services/adm.configuracion-aseguradora.service';
import { AdmConfiguracionAseguradoraRequestDto } from '../helpers/adm.configuracion-aseguradora.request.dto';

@Controller('administracion/configuracion-aseguradora')
@ApiTags('Configuracion-Aseguradora')
export class AdmConfiguracionAseguradoraController {
  constructor(
    private readonly admConfigAseguradoraService: AdmConfiguracionAseguradoraService,
  ) {}

  @Post()
  async create(
    @Body() body: AdmConfiguracionAseguradoraRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.admConfigAseguradoraService.create({
      body,
      lang: i18n.lang,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('paginate')
  async paginate(@Request() req: any, @I18n() i18n: I18nContext) {
    return await this.admConfigAseguradoraService.findAll({
      paginateParams: req?.paginate,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('get-catalogs')
  async getCatalogs(@Request() req: any, @I18n() i18n: I18nContext) {
    return await this.admConfigAseguradoraService.getCatalogosToCreate({
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
  ) {
    return await this.admConfigAseguradoraService.findOneToEdit({
      id,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: AdmConfiguracionAseguradoraRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.admConfigAseguradoraService.update({
      id,
      data: data,
      lang: i18n.lang,
    });
  }
}
